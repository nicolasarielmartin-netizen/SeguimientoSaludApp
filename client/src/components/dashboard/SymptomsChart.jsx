
import { useState } from 'react'

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

const symptomData = {
  Migraña: [
    { day: 'Lun', frequency: 1, intensity: 3 },
    { day: 'Mar', frequency: 0, intensity: 0 },
    { day: 'Mié', frequency: 2, intensity: 7 },
    { day: 'Jue', frequency: 1, intensity: 4 },
    { day: 'Vie', frequency: 0, intensity: 0 },
    { day: 'Sáb', frequency: 1, intensity: 2 },
    { day: 'Dom', frequency: 1, intensity: 3 }
  ],

  Fatiga: [
    { day: 'Lun', frequency: 1, intensity: 5 },
    { day: 'Mar', frequency: 1, intensity: 4 },
    { day: 'Mié', frequency: 2, intensity: 7 },
    { day: 'Jue', frequency: 1, intensity: 5 },
    { day: 'Vie', frequency: 1, intensity: 3 },
    { day: 'Sáb', frequency: 1, intensity: 4 },
    { day: 'Dom', frequency: 0, intensity: 0 }
  ],

  Dolor: [
    { day: 'Lun', frequency: 0, intensity: 0 },
    { day: 'Mar', frequency: 1, intensity: 3 },
    { day: 'Mié', frequency: 1, intensity: 4 },
    { day: 'Jue', frequency: 2, intensity: 6 },
    { day: 'Vie', frequency: 1, intensity: 5 },
    { day: 'Sáb', frequency: 0, intensity: 0 },
    { day: 'Dom', frequency: 1, intensity: 2 }
  ]
}

const SymptomsChart = () => {
  const [selectedSymptom, setSelectedSymptom] = useState('Migraña')

  const data = symptomData[selectedSymptom]

  const totalEpisodes = data.reduce(
    (sum, item) => sum + item.frequency,
    0
  )

  const recordedDays = data.filter(
    (item) => item.frequency > 0
  )

  const averageIntensity = recordedDays.length
    ? (
        recordedDays.reduce((sum, item) => sum + item.intensity, 0) /
        recordedDays.length
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

          <h2 className="mt-2 text-xl font-semibold text-[#344B3A]">
            Síntomas
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Frecuencia e intensidad de los episodios
          </p>
        </div>

        <div className="rounded-xl bg-[#F8E9DF] px-4 py-3">
          <p className="text-xs text-[#A66A49]">
            Episodios registrados
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#945F43]">
            {totalEpisodes}
          </p>
        </div>
      </div>

      {/* SYMPTOM SELECTOR */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-gray-500">
          Seleccionar síntoma
        </p>

        <div className="flex flex-wrap gap-2">
          {Object.keys(symptomData).map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => setSelectedSymptom(symptom)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                selectedSymptom === symptom
                  ? 'bg-[#344B3A] text-white'
                  : 'bg-[#F5F0E6] text-[#766B58] hover:bg-[#EDE7D9]'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F8E9DF] p-4">
          <p className="text-xs text-[#A66A49]">
            Total de episodios
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#945F43]">
            {totalEpisodes}
          </p>
        </div>

        <div className="rounded-xl bg-[#E5EFED] p-4">
          <p className="text-xs text-[#527C75]">
            Intensidad promedio
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#426D65]">
            {averageIntensity}<span className="text-sm"> / 10</span>
          </p>
        </div>
      </div>

      {/* COMBINED CHART */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[#344B3A]">
          Evolución semanal
        </h3>

        <div className="mt-4 flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-[#D9A17F]" />
            <span className="text-xs text-gray-500">
              Frecuencia (episodios)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-[#527C75]" />
            <span className="text-xs text-gray-500">
              Intensidad (0–10)
            </span>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 5, left: -15, bottom: 5 }}
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
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E9E9E0',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  value,
                  name === 'frequency'
                    ? 'Episodios'
                    : 'Intensidad (0–10)'
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
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Datos ficticios. La intensidad es una escala subjetiva de 0 a 10.
        Los días sin episodios no se interpretan como ausencia de síntomas
        si no se realizó el registro.
      </p>

    </section>
  )
}

export default SymptomsChart
