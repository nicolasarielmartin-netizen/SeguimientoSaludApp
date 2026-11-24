import { useEffect, useState } from 'react'

import {
  getIndicators,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getHealthRecords,
  createHealthRecord,
  deleteHealthRecord
} from '../services/healthService'
import {
  getSymptoms,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getSymptomRecords,
  createSymptomRecord,
  deleteSymptomRecord
} from '../services/symptomService'

const inputClass =
  'w-full rounded-xl border border-[#E9E9E0] bg-white px-3 py-2 text-sm text-[#344B3A] focus:outline-none focus:ring-2 focus:ring-[#789477]'
const buttonClass =
  'rounded-xl bg-[#344B3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#42634C] disabled:opacity-50'
const smallButtonClass =
  'rounded-lg border border-[#E9E9E0] px-2 py-1 text-xs font-medium text-[#344B3A] hover:bg-[#F7F7F1]'
const dangerButtonClass =
  'rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50'
const cardClass =
  'rounded-2xl border border-[#E9E9E0] bg-white p-5 shadow-sm'

const INDICATOR_FIELDS = {
  name: 'Nombre',
  category: 'Categoría',
  unit: 'Unidad',
  description: 'Descripción'
}
const SYMPTOM_FIELDS = {
  name: 'Nombre',
  description: 'Descripción'
}



const formatDate = (value) =>
  value ? new Date(value).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' }) : ''

const Registros = () => {
  const [indicators, setIndicators] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [recordsCache, setRecordsCache] = useState({}) // { "indicator:ID": [...], "symptom:ID": [...] }
  const [openKey, setOpenKey] = useState(null)         // lista de registros abierta
  const [editing, setEditing] = useState(null)         // { type, id, values }
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAll = async () => {
    const [ind, sym] = await Promise.all([getIndicators(), getSymptoms()])
    setIndicators(ind.filter((i) => i.isActive !== false))
    setSymptoms(sym.filter((s) => s.isActive !== false))
  }

  // key: "indicator:ID" o "symptom:ID"
  const loadRecords = async (key) => {
    const [type, id] = key.split(':')
    const list = type === 'indicator'
      ? await getHealthRecords(id)
      : await getSymptomRecords(id)
    setRecordsCache((prev) => ({ ...prev, [key]: list }))
  }

const [newType, setNewType] = useState('measure')

  useEffect(() => {
    loadAll().catch(() => setError('No se pudieron cargar tus datos'))
  }, [])

  // Ejecuta una acción, muestra el resultado y recarga las listas.
  // reloadKey: si esa lista de registros está abierta, se vuelve a cargar.
  const run = async (action, okText, reloadKey = null) => {
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(okText)
      await loadAll()
      if (reloadKey && openKey === reloadKey) {
        await loadRecords(reloadKey)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error, inténtalo de nuevo')
    }
  }

  // ----- Crear -----

  const handleIndicator = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    run(async () => {
      await createIndicator(data)
      form.reset()
          {item.trackingType === 'check' ? (
      'Cumplido'
    ) : type === 'indicator' ? (
      <>
        {r.value}
        {r.secondaryValue != null && ` / ${r.secondaryValue}`} {item.unit}
      </>
    ) : (
      <>
        {r.frequency} episodio(s), intensidad {r.intensity}/10
      </>
    )}

    }, 'Habito creado')
  }

  const handleRecord = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const { indicatorId, value, secondaryValue, measuredAt, notes } =
      Object.fromEntries(new FormData(form))
    run(async () => {
      await createHealthRecord(indicatorId, {
        value: Number(value),
        ...(secondaryValue && { secondaryValue: Number(secondaryValue) }),
        ...(measuredAt && { measuredAt: new Date(measuredAt).toISOString() }),
        ...(notes && { notes })
      })
      form.reset()
    }, 'Medición registrada', `indicator:${indicatorId}`)
  }

  const handleSymptom = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    run(async () => {
      await createSymptom(data)
      form.reset()
    }, 'malestar creado')
  }

  const handleEpisode = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const { symptomId, frequency, intensity, recordedAt, notes } =
      Object.fromEntries(new FormData(form))
    run(async () => {
      await createSymptomRecord(symptomId, {
        frequency: Number(frequency),
        intensity: Number(intensity),
        ...(recordedAt && { recordedAt: new Date(recordedAt).toISOString() }),
        ...(notes && { notes })
      })
      form.reset()
    }, 'Episodio registrado', `symptom:${symptomId}`)
  }

  // ----- Editar -----

  const handleEdit = (type, item) => {
    const values =
      type === 'indicator'
        ? {
            name: item.name,
            category: item.category || '',
            unit: item.unit,
            description: item.description || ''
          }
        : {
            name: item.name,
            description: item.description || ''
          }
    setEditing({ type, id: item._id, values })
  }

  const saveEdit = () => {
    const { type, id, values } = editing
    const fn = type === 'indicator' ? updateIndicator : updateSymptom
    const okText = type === 'indicator' ? 'Habito actualizado' : 'malestar actualizado'
    run(async () => {
      await fn(id, values)
      setEditing(null)
    }, okText)
  }

  // ----- Eliminar -----

  const removeItem = (type, item) => {
    const extra =
      type === 'indicator'
        ? 'Se eliminarán también todas sus mediciones.'
        : 'Se eliminarán también todos sus episodios.'
    if (!window.confirm(`¿Eliminar "${item.name}"? ${extra} Esta acción no se puede deshacer.`)) return

    if (openKey === `${type}:${item._id}`) setOpenKey(null)
    const fn = type === 'indicator' ? deleteIndicator : deleteSymptom
    run(() => fn(item._id), 'Eliminado correctamente')
  }

  const removeRecord = (type, parentId, recordId) => {
    if (!window.confirm('¿Eliminar este registro?')) return
    const fn = type === 'indicator' ? deleteHealthRecord : deleteSymptomRecord
    run(() => fn(parentId, recordId), 'Registro eliminado', `${type}:${parentId}`)
  }

  // ----- Ver registros de una tarjeta -----

  const toggleRecords = async (key) => {
    if (openKey === key) {
      setOpenKey(null)
      return
    }
    setOpenKey(key)
    try {
      await loadRecords(key)
    } catch {
      setError('No se pudieron cargar los registros')
    }
  }

  // ----- Render -----

  const renderRecords = (type, item) => {
    const key = `${type}:${item._id}`
    if (openKey !== key) return null

    const list = recordsCache[key]
    if (!list) return <p className="mt-2 text-xs text-gray-400">Cargando...</p>
    if (!list.length) {
      return <p className="mt-2 text-xs text-gray-400">Sin registros todavía.</p>
    }

    return (
      <ul className="mt-2 space-y-1 border-t border-[#F0F0E9] pt-2">
        {list.map((r) => (
          <li key={r._id} className="flex items-start justify-between gap-2 text-xs text-gray-600">
            <span>
              {type === 'indicator' ? (
                <>
                  {r.value}
                  {r.secondaryValue != null && ` / ${r.secondaryValue}`} {item.unit}
                </>
              ) : (
                <>
                  {r.frequency} episodio(s), intensidad {r.intensity}/10
                </>
              )}
              <span className="text-gray-400">
                {' '}· {formatDate(type === 'indicator' ? r.measuredAt : r.recordedAt)}
              </span>
              {r.notes && <span className="block text-gray-400">{r.notes}</span>}
            </span>
            <button
              type="button"
              onClick={() => removeRecord(type, item._id, r._id)}
              className={dangerButtonClass}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    )
  }

  const renderItem = (type, item) => {
    const key = `${type}:${item._id}`
    const isEditing = editing?.type === type && editing?.id === item._id
    const isOpen = openKey === key
    const fields = type === 'indicator' ? INDICATOR_FIELDS : SYMPTOM_FIELDS

    return (
      <li key={item._id} className="rounded-xl border border-[#F0F0E9] p-3">
        {isEditing ? (
          <div className="space-y-2">
            {Object.keys(fields).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs text-gray-500">{fields[field]}</label>
                <input
                  value={editing.values[field]}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      values: { ...editing.values, [field]: e.target.value }
                    })
                  }
                  className={inputClass}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={saveEdit} className={buttonClass}>
                Guardar
              </button>
              <button type="button" onClick={() => setEditing(null)} className={smallButtonClass}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#344B3A]">{item.name}</p>
                <p className="truncate text-xs text-gray-400">
                  {type === 'indicator'
                    ? `Unidad: ${item.unit}${item.category ? ` · ${item.category}` : ''}`
                    : item.description || 'Sin descripción'}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                <button type="button" onClick={() => toggleRecords(key)} className={smallButtonClass}>
                  {isOpen ? 'Ocultar' : type === 'indicator' ? 'Mediciones' : 'Episodios'}
                </button>
                <button type="button" onClick={() => handleEdit(type, item)} className={smallButtonClass}>
                  Editar
                </button>
                <button type="button" onClick={() => removeItem(type, item)} className={dangerButtonClass}>
                  Eliminar
                </button>
              </div>
            </div>

            {renderRecords(type, item)}
          </>
        )}
      </li>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#344B3A]">Registros</h1>
        <p className="mt-1 text-sm text-gray-400">
          Crea tus Habitos, Malestares y registra mediciones o episodios.
        </p>
      </header>

      {message && (
        <p className="rounded-xl bg-[#E6EEE4] px-4 py-3 text-sm text-[#42634C]">{message}</p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Habitos: formulario + lista */}
        <div className="space-y-6">
          <form onSubmit={handleIndicator} className={`${cardClass} space-y-3`}>
              <h2 className="font-semibold text-[#344B3A]">Nuevo indicador</h2>
              <input name="name" placeholder="Nombre (ej. Lavarse los dientes, Correr)" required maxLength={60} className={inputClass} />
              <select
                name="trackingType"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className={inputClass}
              >
                <option value="check">Check de cumplimiento (lo hice o no)</option>
                <option value="measure">Unidad de medida (ej. minutos, km)</option>
              </select>
              {newType === 'measure' && (
                <input name="unit" placeholder="Unidad (ej. min, km, mmHg)" required maxLength={20} className={inputClass} />
              )}
              <input name="category" placeholder="Categoría (opcional)" maxLength={40} className={inputClass} />
              <textarea name="description" placeholder="Descripción (opcional)" maxLength={250} rows={2} className={inputClass} />
              <button type="submit" className={buttonClass}>Crear indicador</button>
            </form>

          <div className={cardClass}>
            <h3 className="mb-3 text-sm font-semibold text-[#344B3A]">Tus Habitos</h3>
            {indicators.length === 0 ? (
              <p className="text-xs text-gray-400">Aún no tienes Habitos.</p>
            ) : (
              <ul className="space-y-2">
                {indicators.map((i) => renderItem('indicator', i))}
              </ul>
            )}
          </div>
        </div>

        {/* MEDICIONES: formulario (la lista está en cada Habito) */}
        <div className="space-y-6">
          <form onSubmit={handleRecord} className={`${cardClass} space-y-3`}>
            <h2 className="font-semibold text-[#344B3A]">Registrar medición</h2>
            <select name="indicatorId" required className={inputClass} defaultValue="">
              <option value="" disabled>Elige un Habito</option>
              {indicators.map((i) => (
                <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>
              ))}
            </select>
            <input name="value" type="number" step="any" placeholder="Valor" required className={inputClass} />
            <input name="secondaryValue" type="number" step="any" placeholder="Valor secundario (opcional)" className={inputClass} />
            <input name="measuredAt" type="datetime-local" className={inputClass} />
            <textarea name="notes" placeholder="Notas (opcional)" maxLength={500} rows={2} className={inputClass} />
            <button type="submit" disabled={!indicators.length} className={buttonClass}>Guardar medición</button>
            {!indicators.length && <p className="text-xs text-gray-400">Crea primero un Habito.</p>}
          </form>
        </div>

        {/* malestarS: formulario + lista */}
        <div className="space-y-6">
          <form onSubmit={handleSymptom} className={`${cardClass} space-y-3`}>
            <h2 className="font-semibold text-[#344B3A]">Nuevo Malestar</h2>
            <input name="name" placeholder="Nombre (ej. Migraña)" required maxLength={60} className={inputClass} />
            <textarea name="description" placeholder="Descripción (opcional)" maxLength={250} rows={2} className={inputClass} />
            <button type="submit" className={buttonClass}>Crear malestar</button>
          </form>

          <div className={cardClass}>
            <h3 className="mb-3 text-sm font-semibold text-[#344B3A]">Tus malestares</h3>
            {symptoms.length === 0 ? (
              <p className="text-xs text-gray-400">Aún no tienes malestares.</p>
            ) : (
              <ul className="space-y-2">
                {symptoms.map((s) => renderItem('symptom', s))}
              </ul>
            )}
          </div>
        </div>

        {/* EPISODIOS: formulario (la lista está en cada malestar) */}
        <div className="space-y-6">
          <form onSubmit={handleEpisode} className={`${cardClass} space-y-3`}>
            <h2 className="font-semibold text-[#344B3A]">Registrar episodio</h2>
            <select name="symptomId" required className={inputClass} defaultValue="">
              <option value="" disabled>Elige un malestar</option>
              {symptoms.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <input name="frequency" type="number" min="1" placeholder="Frecuencia (episodios)" required className={inputClass} />
            <input name="intensity" type="number" min="0" max="10" step="0.5" placeholder="Intensidad (0 a 10)" required className={inputClass} />
            <input name="recordedAt" type="datetime-local" className={inputClass} />
            <textarea name="notes" placeholder="Notas (opcional)" maxLength={500} rows={2} className={inputClass} />
            <button type="submit" disabled={!symptoms.length} className={buttonClass}>Guardar episodio</button>
            {!symptoms.length && <p className="text-xs text-gray-400">Crea primero un malestar.</p>}
          </form>
        </div>

      </div>
    </div>
  )
}

export default Registros
