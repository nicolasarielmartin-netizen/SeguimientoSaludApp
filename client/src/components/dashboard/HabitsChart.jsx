
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

const weeklyProgress = [
  { day: 'Lun', value: 70 },
  { day: 'Mar', value: 75 },
  { day: 'Mié', value: 65 },
  { day: 'Jue', value: 80 },
  { day: 'Vie', value: 85 },
  { day: 'Sáb', value: 90 },
  { day: 'Dom', value: 82 }
]

const habitDetails = [
  { habit: 'Hidratación', compliance: 90 },
  { habit: 'Actividad física', compliance: 70 },
  { habit: 'Descanso', compliance: 85 },
  { habit: 'Medicación', compliance: 100 }
]

const HabitsChart = () => {
  const average = Math.round(
    habitDetails.reduce((sum, item) => sum + item.compliance, 0) /
    habitDetails.length
  )

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
            Seguimiento de tus hábitos durante la semana
          </p>
        </div>

        <div className="rounded-xl bg-[#E6EEE4] px-4 py-3">
          <p className="text-xs text-[#6D806C]">
            Promedio por hábito
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#42634C]">
            {average}%
          </p>
        </div>
      </div>

      {/* GENERAL PROGRESS */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[#344B3A]">
          Cumplimiento general diario
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          Porcentaje de hábitos completados cada día
        </p>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyProgress}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#EEEEEA"
                strokeDasharray="3 3"
                vertical={false}
              />

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
                formatter={(value) => [`${value}%`, 'Cumplimiento']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E9E9E0'
                }}
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

      {/* INDIVIDUAL HABITS */}
      <div className="mt-8 border-t border-[#F0F0E9] pt-7">
        <h3 className="text-sm font-semibold text-[#344B3A]">
          Cumplimiento por hábito
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          Porcentaje de cumplimiento durante los últimos 7 días
        </p>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={habitDetails}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#EEEEEA"
                strokeDasharray="3 3"
                horizontal={false}
              />

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
                formatter={(value) => [`${value}%`, 'Cumplimiento']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E9E9E0'
                }}
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
        Datos ficticios para demostración.
      </p>

    </section>
  )
}

export default HabitsChart
