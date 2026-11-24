import PDFDocument from 'pdfkit'
import { z } from 'zod'

import HealthIndicator from '../models/HealthIndicator.js'
import HealthRecord from '../models/HealthRecord.js'
import Symptom from '../models/Symptom.js'
import SymptomRecord from '../models/SymptomRecord.js'

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000

const querySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date()
  })
  .refine(
    (q) => q.from <= q.to && q.to - q.from <= MAX_RANGE_MS,
    { message: 'El rango debe ser válido y no superar un año' }
  )

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })

const average = (nums) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null

const round1 = (n) => (n === null ? '-' : n.toFixed(1))

export const downloadHealthReport = async (req, res) => {
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Rango de fechas no válido' })
  }

  const { from, to } = parsed.data
  const userId = req.user._id

  try {
    const [indicators, healthRecords, symptoms, symptomRecords] = await Promise.all([
      HealthIndicator.find({ user: userId, isActive: { $ne: false } })
        .sort({ name: 1 })
        .lean(),
      HealthRecord.find({ user: userId, measuredAt: { $gte: from, $lte: to } })
        .sort({ measuredAt: 1 })
        .lean(),
      Symptom.find({ user: userId, isActive: { $ne: false } })
        .sort({ name: 1 })
        .lean(),
      SymptomRecord.find({ user: userId, recordedAt: { $gte: from, $lte: to } })
        .sort({ recordedAt: 1 })
        .lean()
    ])

    const fileName = `informe-salud-${from.toISOString().slice(0, 10)}_${to
      .toISOString()
      .slice(0, 10)}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-store')

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: { Title: 'Informe de seguimiento de salud' }
    })
    doc.pipe(res)

    // Encabezado
    doc.fontSize(18).fillColor('#344B3A').text('Informe de seguimiento de salud')
    doc.moveDown(0.3)
    doc.fontSize(10).fillColor('#666666')
    doc.text(`Periodo: ${fmtDate(from)} al ${fmtDate(to)}`)
    doc.text(`Generado: ${fmtDate(new Date())}`)
    doc.text(`Usuario: ${req.user.name}`)
    doc.moveDown()

    // Indicadores
    doc.fontSize(13).fillColor('#344B3A').text('Indicadores')
    doc.moveDown(0.5)

    if (!indicators.length) {
      doc.fontSize(10).fillColor('#666666').text('No hay indicadores registrados.')
    }

    for (const indicator of indicators) {
      const records = healthRecords.filter(
        (r) => String(r.indicator) === String(indicator._id)
      )
      const values = records.map((r) => r.value)

      doc.fontSize(11).fillColor('#000000').text(`${indicator.name} (${indicator.unit})`)
      doc.fontSize(10).fillColor('#444444')

      if (!records.length) {
        doc.text('Sin mediciones en el periodo.')
      } else {
        const last = records[records.length - 1]
        const lastValue =
          last.secondaryValue != null
            ? `${last.value} / ${last.secondaryValue}`
            : `${last.value}`

        doc.text(
          `Mediciones: ${records.length} | Promedio: ${round1(average(values))} | ` +
            `Mínimo: ${Math.min(...values)} | Máximo: ${Math.max(...values)}`
        )
        doc.text(`Última medición: ${lastValue} ${indicator.unit} el ${fmtDateTime(last.measuredAt)}`)
      }
      doc.moveDown(0.6)
    }

    // Síntomas
    doc.moveDown()
    doc.fontSize(13).fillColor('#344B3A').text('Síntomas')
    doc.moveDown(0.5)

    if (!symptoms.length) {
      doc.fontSize(10).fillColor('#666666').text('No hay síntomas registrados.')
    }

    for (const symptom of symptoms) {
      const episodes = symptomRecords.filter(
        (r) => String(r.symptom) === String(symptom._id)
      )

      doc.fontSize(11).fillColor('#000000').text(symptom.name)
      doc.fontSize(10).fillColor('#444444')

      if (!episodes.length) {
        doc.text('Sin episodios en el periodo.')
      } else {
        const total = episodes.reduce((sum, r) => sum + r.frequency, 0)
        const days = new Set(episodes.map((r) => new Date(r.recordedAt).toDateString())).size
        const intensities = episodes.map((r) => r.intensity)

        doc.text(
          `Episodios: ${total} en ${days} día(s) | ` +
            `Intensidad promedio: ${round1(average(intensities))}/10 | ` +
            `Máxima: ${Math.max(...intensities)}/10`
        )
      }
      doc.moveDown(0.6)
    }

    // Aviso
    doc.moveDown()
    doc
      .fontSize(8)
      .fillColor('#888888')
      .text(
        'Este informe resume los datos registrados por el usuario. ' +
          'No sustituye el diagnóstico ni el consejo de un profesional de salud.'
      )

    doc.end()
  } catch (error) {
    // Solo el tipo de error: no se registran datos de salud
    console.error('downloadHealthReport:', error.name)
    if (!res.headersSent) {
      return res.status(500).json({ message: 'No se pudo generar el informe' })
    }
    res.end()
  }
}
