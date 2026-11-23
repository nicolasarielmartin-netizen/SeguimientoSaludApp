import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

import { getIndicators, getHealthRecords } from '../../services/healthService'
import { lastSevenDays, toDayKey } from '../../utils/days'

const HabitsChart = () => {
  const [indicators, setIndicators] = useState([])
  const [recordsByIndicator, setRecordsByIndicator] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const days = useMemo(() => lastSevenDays(), [])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const list = await getIndicators()
        const entries = await Promise.all(
          list.map(async (indicator) => [
            indicator._id,
            await getHealthRecords(indicator._id)
          ])
        )
        if (!active) return
        setIndicators(list)
        setRecordsByIndicator(Object.fromEntries(entries))
      } catch (err) {
        if (active) setError('No se pudieron cargar tus indicadores')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const activeIndicators = indicators.filter((i) => i.isActive !== false)
  const dayKeys = new Set(days.map((d) => d.key))

  // Por indicador: en cuántos de los últimos 7 días tiene al menos una medición
  const perIndicator = activeIndicators.map((indicator) => {
    const measuredDays = new Set(
      (recordsByIndicator[indicator._id] || [])
        .map((r) => toDayKey(r.measuredAt))
        .filter((key) => dayKeys.has(key))
    )
    return {
      habit: indicator.name,
      compliance: Math.round((measuredDays.size / 7) * 100)
    }
  })

  // Por día: qué porcentaje de indicadores tiene al menos una medición
  const weeklyProgress = days.map((day) => {
    const measured = activeIndicators.filter((indicator) =>
      (recordsByIndicator[indicator._id] || []).some(
        (r) => toDayKey(r.measuredAt) === day.key
      )
    ).length

    return {
      day: day.label,
      value: activeIndicators.length
        ? Math.round((measured / activeIndicators.length) * 100)
        : 0
    }
  })

  const average = perIndicator.length
    ? Math.round(
        perIndicator.reduce((sum, item) => sum + item.compliance, 0) /
          perIndicator.length
      )
    : 0

  return (
    <section className="rounded-2xl border border-[#E9E9E0] bg-white p-5 shadow-sm sm:p-7">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#789477]">
            BIENESTAR
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#344B3A]">
            Hábitos saludables
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Días con registro en la última semana
          </p>
        </div>

        <div className="rounded-xl bg-[#E6EEE4] px-4 py-3">
          <p className="text-xs text-[#6D8068]">Promedio por indicador</p>
          <p className="mt-1 text-2xl font-semibold text-[#42634C]">{average}%</p>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-400">Cargando...</p>}

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && activeIndicators.length === 0 && (
        <p className="mt-6 text-sm text-gray-400">
          Aún no tienes indicadores. Crea uno para ver tu seguimiento.
        </p>
      )}

      {!loading && !error && activeIndicators.length > 0 && (
        <>
          {/* GENERAL */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#344B3A]">
              Registro diario
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Porcentaje de indicadores con al menos una medición cada día
            </p>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyProgress}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="#EEEEEA" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#92998F', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#92998F', fontSize: 11 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Registro']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E9E9E0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#789477"
                    strokeWidth={3}
                    dot={{ fill: '#789477', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* POR INDICADOR */}
          <div className="mt-8 border-t border-[#F0F0E9] pt-7">
            <h3 className="text-sm font-semibold text-[#344B3A]">
              Registro por indicador
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Días con medición en los últimos 7 días
            </p>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={perIndicator}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                >
                  <CartesianGrid stroke="#EEEEEA" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#92998F', fontSize: 11 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="habit"
                    axisLine={false}
                    tickLine={false}
                    width={105}
                    tick={{ fill: '#687568', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Registro']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E9E9E0' }}
                  />
                  <Bar
                    dataKey="compliance"
                    fill="#8DA88A"
                    radius={[0, 8, 8, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Un día cuenta como registrado si tiene al menos una medición.
          </p>
        </>
      )}
    </section>
  )
}

export default HabitsChart
