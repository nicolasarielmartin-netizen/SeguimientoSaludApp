import { useState } from 'react'
import { downloadHealthReport, readError } from '../services/reportService'

const inputClass =
  'w-full rounded-xl border border-[#E9E9E0] bg-white px-3 py-2 text-sm text-[#344B3A] focus:outline-none focus:ring-2 focus:ring-[#789477]'

// Fecha local como YYYY-MM-DD, hace `offset` días
const localDate = (offset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const Informes = () => {
  const [from, setFrom] = useState(localDate(30))
  const [to, setTo] = useState(localDate(0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async (e) => {
    e.preventDefault()
    setError('')

    if (from > to) {
      setError('La fecha inicial no puede ser posterior a la final')
      return
    }

    setLoading(true)
    try {
      await downloadHealthReport(
        new Date(`${from}T00:00:00`).toISOString(),
        new Date(`${to}T23:59:59.999`).toISOString()
      )
    } catch (err) {
      setError(await readError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#344B3A]">Informes</h1>
        <p className="mt-1 text-sm text-gray-400">
          Descarga un PDF con tus indicadores y malestares del periodo que elijas.
        </p>
      </header>

      <form
        onSubmit={handleDownload}
        className="space-y-4 rounded-2xl border border-[#E9E9E0] bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          El informe incluye, por cada indicador, el número de mediciones, promedio, mínimo, máximo y última medición. Por cada síntoma, los episodios, los días con episodios e intensidad.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#344B3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#42634C] disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Descargar PDF'}
        </button>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  )
}

export default Informes
