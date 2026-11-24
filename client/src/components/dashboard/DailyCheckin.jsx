import { useEffect, useState } from 'react'

import { getIndicators, getHealthRecords, createHealthRecord } from '../../services/healthService'
import { toDayKey } from '../../utils/days'

const inputClass =
  'w-full rounded-xl border border-[#E9E9E0] bg-white px-3 py-2 text-sm text-[#344B3A] focus:outline-none focus:ring-2 focus:ring-[#789477]'

const skipKey = () => `checkin-skip-${toDayKey(new Date())}`

// Un check se completa con la casilla; una medición, con el valor numérico
const isFilled = (indicator, v = {}) =>
  indicator.trackingType === 'check' ? Boolean(v.done) : Boolean(v.value)

const DailyCheckin = () => {
  const [pending, setPending] = useState([])   // indicadores sin registro hoy
  const [values, setValues] = useState({})     // { [id]: { done, value, secondaryValue } }
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Al entrar, busca los indicadores que aún no tienen registro de hoy
  useEffect(() => {
    if (localStorage.getItem(skipKey())) return

    let active = true

    const load = async () => {
      try {
        const list = (await getIndicators()).filter((i) => i.isActive !== false)
        if (!list.length) return

        const today = toDayKey(new Date())
        const checks = await Promise.all(
          list.map(async (indicator) => {
            const records = await getHealthRecords(indicator._id)
            const doneToday = records.some((r) => toDayKey(r.measuredAt) === today)
            return doneToday ? null : indicator
          })
        )

        const missing = checks.filter(Boolean)
        if (active && missing.length) {
          setPending(missing)
          setOpen(true)
        }
      } catch {
        // Si falla la carga, simplemente no se muestra el pop up
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const updateValue = (id, field, value) =>
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))

  const handleSave = async () => {
    const entries = pending.filter((i) => isFilled(i, values[i._id]))

    if (!entries.length) {
      setMessage('Marca un hábito o escribe al menos una medición, o pulsa "Omitir por hoy".')
      return
    }

    setSaving(true)
    setMessage('')

    const measuredAt = new Date().toISOString()

    const results = await Promise.allSettled(
      entries.map((i) => {
        const v = values[i._id]

        if (i.trackingType === 'check') {
          return createHealthRecord(i._id, { measuredAt })
        }

        return createHealthRecord(i._id, {
          value: Number(v.value),
          ...(v.secondaryValue && { secondaryValue: Number(v.secondaryValue) }),
          measuredAt
        })
      })
    )

    const savedIds = entries
      .filter((_, idx) => results[idx].status === 'fulfilled')
      .map((i) => i._id)
    const left = pending.filter((i) => !savedIds.includes(i._id))

    setSaving(false)

    if (left.length) {
      setPending(left)
      setMessage(
        `No se pudieron guardar: ${left.map((i) => i.name).join(', ')}. Inténtalo de nuevo.`
      )
      return
    }

    localStorage.setItem(skipKey(), 'done')
    setOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem(skipKey(), 'skipped')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-xs font-semibold tracking-widest text-[#789477]">REGISTRO DE HOY</p>
        <h2 className="mt-2 text-xl font-semibold text-[#344B3A]">¿Cómo estás hoy?</h2>
        <p className="mt-1 text-sm text-gray-400">
          Completa tus hábitos de una vez. Los que no marques o dejes vacíos no se guardan.
        </p>

        <div className="mt-6 space-y-4">
          {pending.map((indicator) => (
            <div key={indicator._id} className="rounded-xl border border-[#F0F0E9] p-4">
              <label className="mb-2 block text-sm font-medium text-[#344B3A]">
                {indicator.name}{' '}
                {indicator.trackingType !== 'check' && (
                  <span className="text-gray-400">({indicator.unit})</span>
                )}
              </label>

              {indicator.trackingType === 'check' ? (
                <label className="flex items-center gap-3 text-sm text-[#344B3A]">
                  <input
                    type="checkbox"
                    checked={Boolean(values[indicator._id]?.done)}
                    onChange={(e) => updateValue(indicator._id, 'done', e.target.checked)}
                    className="h-5 w-5 accent-[#344B3A]"
                  />
                  Lo hice hoy
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Valor"
                    value={values[indicator._id]?.value ?? ''}
                    onChange={(e) => updateValue(indicator._id, 'value', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Secundario (opcional)"
                    value={values[indicator._id]?.secondaryValue ?? ''}
                    onChange={(e) => updateValue(indicator._id, 'secondaryValue', e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-xl border border-[#E9E9E0] px-4 py-2 text-sm font-medium text-[#344B3A] hover:bg-[#F7F7F1]"
          >
            Omitir por hoy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#344B3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#42634C] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar todo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyCheckin
