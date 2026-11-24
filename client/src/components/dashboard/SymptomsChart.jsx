import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

import { getSymptoms, getSymptomRecords } from '../../services/symptomService'
import { lastSevenDays, toDayKey } from '../../utils/days'

const SymptomsChart = () => {
  const [symptoms, setSymptoms] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const days = useMemo(() => lastSevenDays(), [])
  const dayKeys = useMemo(() => new Set(days.map((d) => d.key)), [days])

  // Cargar malestares del usuario
  useEffect(() => {
    let active = true

    getSymptoms()
      .then((list) => {
        if (!active) return
        const visible = list.filter((s) => s.isActive !== false)
        setSymptoms(visible)
        if (visible.length) setSelectedId(visible[0]._id)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar tus malestares')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Cargar episodios del malestar seleccionado
  useEffect(() => {
    if (!selectedId) {
      setRecords([])
      return
    }

    let active = true

    getSymptomRecords(selectedId)
      .then((list) => {
        if (active) setRecords(list)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los episodios')
      })

    return () => {
      active = false
    }
  }, [selectedId])

  const weekRecords = records.filter((r) => dayKeys.has(toDayKey(r.recordedAt)))

  // Un punto por día. Si no hay registro, intensidad queda en null para no
  // dibujar un 0 que parezca ausencia de malestares.
  const data = days.map((day) => {
    const dayRecords = weekRecords.filter(
      (r) => toDayKey(r.recordedAt) === day.key
    )
    const frequency = dayRecords.reduce((sum, r) => sum + r.frequency, 0)
    const intensity = dayRecords.length
      ? Number(
          (
            dayRecords.reduce((sum, r) => sum + r.intensity, 0) /
            dayRecords.length
          ).toFixed(1)
        )
      : null

    return { day: day.label, frequency, intensity }
  })

  const totalEpisodes = weekRecords.reduce((sum, r) => sum + r.frequency, 0)
  const averageIntensity = weekRecords.length
    ? (
        weekRecords.reduce((sum, r) => sum + r.intensity, 0) /
        weekRecords.length
      ).toFixed(1)
    : '0.0'

  return (
    <section className="rounded-2xl border border-[#E9E9E0] bg-white p-5 shadow-sm sm:p-7">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#A77D65]">
            SEGUIMIENTO
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#344B3A]">Malestares</h2>
          <p className="mt-1 text-sm text-gray-400">
            Frecuencia e intensidad de los episodios
          </p>
        </div>

        <div className="rounded-xl bg-[#F8E9DF] px-4 py-3">
          <p className="text-xs text-[#A66A49]">Episodios esta semana</p>
          <p className="mt-1 text-2xl font-semibold text-[#945F43]">{totalEpisodes}</p>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-400">Cargando...</p>}

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && symptoms.length === 0 && (
        <p className="mt-6 text-sm text-gray-400">
          Aún no tienes malestares registrados. Crea uno para empezar a seguirlo.
        </p>
      )}

      {!loading && !error && symptoms.length > 0 && (
        <>
          {/* SELECTOR */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium text-gray-500">
              Seleccionar malestar
            </p>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom._id}
                  type="button"
                  onClick={() => setSelectedId(symptom._id)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    selectedId === symptom._id
                      ? 'bg-[#344B3A] text-white'
                      : 'bg-[#F5F0E6] text-[#766D58] hover:bg-[#EDE7D9]'
                  }`}
                >
                  {symptom.name}
                </button>
              ))}
            </div>
          </div>

          {/* RESUMEN */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F8E9DF] p-4">
              <p className="text-xs text-[#A66A49]">Total de episodios</p>
              <p className="mt-1 text-2xl font-semibold text-[#945F43]">{totalEpisodes}</p>
            </div>
            <div className="rounded-xl bg-[#E5EEED] p-4">
              <p className="text-xs text-[#527C75]">Intensidad promedio</p>
              <p className="mt-1 text-2xl font-semibold text-[#426D65]">
                {averageIntensity}
                <span className="text-sm"> / 10</span>
              </p>
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#344B3A]">Evolución semanal</h3>

            <div className="mt-4 flex flex-wrap gap-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#D9A17F]" />
                <span className="text-xs text-gray-500">Frecuencia (episodios)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-5 bg-[#527C75]" />
                <span className="text-xs text-gray-500">Intensidad (0–10)</span>
              </div>
            </div>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid stroke="#EEEEEA" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#92998F', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="frequency"
                    orientation="left"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A66A49', fontSize: 11 }}
                    label={{
                      value: 'Episodios',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#A66A49',
                      fontSize: 11
                    }}
                  />
                  <YAxis
                    yAxisId="intensity"
                    orientation="right"
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#527C75', fontSize: 11 }}
                    label={{
                      value: 'Intensidad',
                      angle: 90,
                      position: 'insideRight',
                      fill: '#527C75',
                      fontSize: 11
                    }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E9E9E0', fontSize: '12px' }}
                    formatter={(value, name) => [
                      value ?? 'Sin registro',
                      name === 'frequency' ? 'Episodios' : 'Intensidad (0–10)'
                    ]}
                  />
                  <Bar
                    yAxisId="frequency"
                    dataKey="frequency"
                    fill="#D9A17F"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    yAxisId="intensity"
                    type="monotone"
                    dataKey="intensity"
                    stroke="#527C75"
                    strokeWidth={3}
                    dot={{ fill: '#527C75', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Los días sin registro aparecen vacíos. No significan ausencia de malestares si no se realizó el registro.
          </p>
        </>
      )}
    </section>
  )
}

export default SymptomsChart
