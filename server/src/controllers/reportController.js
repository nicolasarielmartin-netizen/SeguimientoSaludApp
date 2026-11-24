import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
import { z } from 'zod'

import HealthIndicator from '../models/HealthIndicator.js'
import HealthRecord from '../models/HealthRecord.js'
import Symptom from '../models/Symptom.js'
import SymptomRecord from '../models/SymptomRecord.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGO_PATH = path.join(__dirname, '../assets/Logo.png')

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000
const MARGIN = 50
const CONTENT_W = 495 // ancho útil de A4 con márgenes de 50

const COLORS = {
  primary: '#344B3A',
  accent: '#789477',
  softGreen: '#E6EEE4',
  rowAlt: '#F7F7F1',
  symptom: '#A66A49',
  softSymptom: '#F8E9DF',
  text: '#222222',
  muted: '#777777',
  line: '#E9E9E0'
}

const querySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date()
  })
  .refine((q) => q.from <= q.to && q.to - q.from <= MAX_RANGE_MS, {
    message: 'El rango debe ser válido y no superar un año'
  })

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fmtDateTime = (d) =>
  new Date(d).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })

const average = (nums) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null

const round1 = (n) => (n === null ? '-' : n.toFixed(1))

// ----- Piezas visuales -----

const drawLogo = (doc, x, y) => {
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, x, y, { fit: [46, 46] })
    return
  }
  doc.roundedRect(x, y, 46, 46, 10).fill(COLORS.primary)
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#FFFFFF')
    .text('CC', x, y + 15, { width: 46, align: 'center', lineBreak: false })
}

const drawReportHeader = (doc, { from, to, userName }) => {
  drawLogo(doc, MARGIN, 40)

  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(COLORS.primary)
    .text('Cuidado Conciente', MARGIN + 56, 42, { lineBreak: false })
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text('Informe de seguimiento de salud', MARGIN + 56, 66, { lineBreak: false })

  const boxX = MARGIN + 260
  const boxW = CONTENT_W - 260
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text)
  doc.text(`Periodo: ${fmtDate(from)} al ${fmtDate(to)}`, boxX, 42, { width: boxW, align: 'right' })
  doc.text(`Usuario: ${userName}`, boxX, 58, { width: boxW, align: 'right' })
  doc.text(`Generado: ${fmtDateTime(new Date())}`, boxX, 74, { width: boxW, align: 'right' })

  doc
    .lineWidth(1)
    .moveTo(MARGIN, 100)
    .lineTo(MARGIN + CONTENT_W, 100)
    .strokeColor(COLORS.line)
    .stroke()

  doc.x = MARGIN
  doc.y = 118
}

// Pie de página: se dibuja en cada página sin provocar saltos de página
const drawPageFooter = (doc, pageNumber) => {
  const bottom = doc.page.margins.bottom
  doc.page.margins.bottom = 0

  doc
    .lineWidth(0.5)
    .moveTo(MARGIN, doc.page.height - 45)
    .lineTo(MARGIN + CONTENT_W, doc.page.height - 45)
    .strokeColor(COLORS.line)
    .stroke()

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text(
      `Cuidado Conciente · Documento confidencial · Página ${pageNumber}`,
      MARGIN,
      doc.page.height - 35,
      { width: CONTENT_W, align: 'center', lineBreak: false }
    )

  doc.page.margins.bottom = bottom
}

const ensureSpace = (doc, needed) => {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom - 40) {
    doc.addPage()
  }
}

const sectionTitle = (doc, title, color) => {
  ensureSpace(doc, 40)
  const y = doc.y
  doc.rect(MARGIN, y + 2, 4, 16).fill(color)
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(COLORS.primary)
    .text(title, MARGIN + 12, y)
  doc.x = MARGIN
  doc.y = y + 28
}

const drawSummaryCards = (doc, cards) => {
  ensureSpace(doc, 80)
  const gap = 12
  const w = (CONTENT_W - gap * (cards.length - 1)) / cards.length
  const y = doc.y
  const h = 62

  cards.forEach((card, i) => {
    const x = MARGIN + i * (w + gap)
    doc.roundedRect(x, y, w, h, 8).fill(card.bg)
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(card.fg)
      .text(card.label, x + 12, y + 10, { width: w - 24, lineBreak: false })
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor(card.fg)
      .text(String(card.value), x + 12, y + 28, { width: w - 24, lineBreak: false })
  })

  doc.x = MARGIN
  doc.y = y + h + 20
}

const drawTable = (doc, headers, rows, widths, color) => {
  const totalW = widths.reduce((a, b) => a + b, 0)
  const headerH = 22

  const drawHeaderRow = () => {
    const y = doc.y
    doc.rect(MARGIN, y, totalW, headerH).fill(color)
    let x = MARGIN
    headers.forEach((h, i) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#FFFFFF')
        .text(h, x + 6, y + 7, { width: widths[i] - 12, lineBreak: false })
      x += widths[i]
    })
    doc.x = MARGIN
    doc.y = y + headerH
  }

  ensureSpace(doc, headerH + 30)
  drawHeaderRow()

  rows.forEach((row, idx) => {
    doc.font('Helvetica').fontSize(9)
    const heights = row.map((cell, i) =>
      doc.heightOfString(String(cell), { width: widths[i] - 12 })
    )
    const rowH = Math.max(...heights, 12) + 8

    if (doc.y + rowH > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage()
      drawHeaderRow()
    }

    const y = doc.y
    if (idx % 2 === 0) {
      doc.rect(MARGIN, y, totalW, rowH).fill(COLORS.rowAlt)
    }

    let x = MARGIN
    row.forEach((cell, i) => {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(String(cell), x + 6, y + 4, { width: widths[i] - 12 })
      x += widths[i]
    })

    doc.x = MARGIN
    doc.y = y + rowH
  })

  doc.y += 16
}

// ----- Controlador -----

export const downloadHealthReport = async (req, res) => {
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Rango de fechas no válido' })
  }

  const { from, to } = parsed.data
  const userId = req.user._id

  try {
    const [indicators, healthRecords, symptoms, symptomRecords] = await Promise.all([
      HealthIndicator.find({ user: userId, isActive: { $ne: false } }).sort({ name: 1 }).lean(),
      HealthRecord.find({ user: userId, measuredAt: { $gte: from, $lte: to } })
        .sort({ measuredAt: 1 })
        .lean(),
      Symptom.find({ user: userId, isActive: { $ne: false } }).sort({ name: 1 }).lean(),
      SymptomRecord.find({ user: userId, recordedAt: { $gte: from, $lte: to } })
        .sort({ recordedAt: 1 })
        .lean()
    ])

    // Filas de indicadores
    const indicatorRows = indicators.map((ind) => {
      const recs = healthRecords.filter((r) => String(r.indicator) === String(ind._id))
      if (!recs.length) return [ind.name, ind.unit, 0, '-', '-', '-', 'Sin datos']

      const values = recs.map((r) => r.value)
      const last = recs[recs.length - 1]
      const lastValue =
        last.secondaryValue != null ? `${last.value}/${last.secondaryValue}` : `${last.value}`

      return [
        ind.name,
        ind.unit,
        recs.length,
        round1(average(values)),
        Math.min(...values),
        Math.max(...values),
        `${lastValue} · ${fmtDate(last.measuredAt)}`
      ]
    })

    // Filas de malestares
    const symptomRows = symptoms.map((s) => {
      const eps = symptomRecords.filter((r) => String(r.symptom) === String(s._id))
      if (!eps.length) return [s.name, 0, 0, '-', '-']

      const total = eps.reduce((sum, r) => sum + r.frequency, 0)
      const days = new Set(eps.map((r) => new Date(r.recordedAt).toDateString())).size
      const ints = eps.map((r) => r.intensity)

      return [
        s.name,
        total,
        days,
        `${round1(average(ints))}/10`,
        `${Math.max(...ints)}/10`
      ]
    })

    const totalEpisodes = symptomRecords.reduce((sum, r) => sum + r.frequency, 0)

    const fileName = `informe-salud-${from.toISOString().slice(0, 10)}_${to
      .toISOString()
      .slice(0, 10)}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-store')

    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      info: { Title: 'Informe de seguimiento de salud', Author: 'Cuidado Conciente' }
    })
    doc.pipe(res)

    let pageNumber = 1
    drawPageFooter(doc, pageNumber)
    doc.on('pageAdded', () => {
      pageNumber += 1
      drawPageFooter(doc, pageNumber)
    })

    drawReportHeader(doc, { from, to, userName: req.user.name })

    drawSummaryCards(doc, [
      { label: 'Indicadores activos', value: indicators.length, bg: COLORS.softGreen, fg: COLORS.primary },
      { label: 'Mediciones en el periodo', value: healthRecords.length, bg: COLORS.softGreen, fg: COLORS.primary },
      { label: 'Episodios en el periodo', value: totalEpisodes, bg: COLORS.softSymptom, fg: COLORS.symptom }
    ])

    sectionTitle(doc, 'Indicadores', COLORS.accent)
    if (!indicators.length) {
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted)
        .text('No hay indicadores registrados.', MARGIN, doc.y)
      doc.moveDown()
    } else {
      drawTable(
        doc,
        ['Indicador', 'Unidad', 'Mediciones', 'Promedio', 'Mín.', 'Máx.', 'Última medición'],
        indicatorRows,
        [120, 50, 70, 60, 45, 45, 105],
        COLORS.accent
      )
    }

    sectionTitle(doc, 'malestares', COLORS.symptom)
    if (!symptoms.length) {
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted)
        .text('No hay malestares registrados.', MARGIN, doc.y)
      doc.moveDown()
    } else {
      drawTable(
        doc,
        ['malestar', 'Episodios', 'Días', 'Intensidad prom.', 'Máxima'],
        symptomRows,
        [175, 80, 70, 100, 70],
        COLORS.symptom
      )
    }

    // Aviso legal
    ensureSpace(doc, 50)
    const noteY = doc.y
    doc.roundedRect(MARGIN, noteY, CONTENT_W, 40, 6).fill(COLORS.softGreen)
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(COLORS.primary)
      .text(
        'Este informe resume los datos registrados por el usuario. No sustituye el diagnóstico ni el consejo de un profesional de salud.',
        MARGIN + 12,
        noteY + 12,
        { width: CONTENT_W - 24 }
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
