import mongoose from 'mongoose'
import { z } from 'zod'
import HealthIndicator from '../models/HealthIndicator.js'
import HealthRecord from '../models/HealthRecord.js'

// Validación de indicadores
const indicatorSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio').max(60),
    trackingType: z.enum(['check', 'measure']).default('measure'),
    category: z.string().trim().max(40).optional(),
    unit: z.string().trim().max(20).optional(),
    description: z.string().trim().max(250).optional()
  })
  .refine((d) => d.trackingType === 'check' || (d.unit && d.unit.length > 0), {
    message: 'La unidad es obligatoria para hábitos de medición',
    path: ['unit']
  })


// GET: Obtener indicadores del usuario
export const getIndicators = async (req, res) => {
  try {
    const indicators = await HealthIndicator.find({
      user: req.user._id
    }).sort({ createdAt: -1 })

    res.json(indicators)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener indicadores'
    })
  }
}

// POST: Crear indicador
export const createIndicator = async (req, res) => {
  const parsed = indicatorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors
    })
  }

  try {
    const indicator = await HealthIndicator.create({
      user: req.user._id,
      ...parsed.data
    })
    return res.status(201).json(indicator)
  } catch (error) {
    console.error('createIndicator:', error)
    return res.status(400).json({
      message: 'No se pudo crear el indicador',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
}

// PUT: Actualizar indicador
export const updateIndicator = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const { name, category, unit, description, isActive } = req.body

    const indicator = await HealthIndicator.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!indicator) {
      return res.status(404).json({
        message: 'Indicador no encontrado'
      })
    }

    if (name !== undefined) indicator.name = name
    if (category !== undefined) indicator.category = category
    if (unit !== undefined) indicator.unit = unit
    if (description !== undefined) indicator.description = description
    if (isActive !== undefined) indicator.isActive = isActive

    await indicator.save()

    res.json(indicator)
  } catch (error) {
    console.error('updateIndicator:', error)
    res.status(400).json({
      message: 'No se pudo actualizar el indicador'
    })
  }
}

// DELETE: Eliminar indicador y sus mediciones
export const deleteIndicator = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const indicator = await HealthIndicator.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!indicator) {
      return res.status(404).json({
        message: 'Indicador no encontrado'
      })
    }

    await HealthRecord.deleteMany({
      indicator: indicator._id,
      user: req.user._id
    })

    await indicator.deleteOne()

    res.json({
      message: 'Indicador y sus mediciones eliminados correctamente'
    })
  } catch (error) {
    console.error('deleteIndicator:', error)
    res.status(500).json({
      message: 'Error al eliminar el indicador'
    })
  }
}

// GET: Obtener mediciones de un indicador
export const getHealthRecords = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const indicator = await HealthIndicator.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!indicator) {
      return res.status(404).json({
        message: 'Indicador no encontrado'
      })
    }

    const records = await HealthRecord.find({
      indicator: indicator._id,
      user: req.user._id
    }).sort({ measuredAt: -1 })

    res.json(records)
  } catch (error) {
    console.error('getHealthRecords:', error)
    res.status(500).json({
      message: 'Error al obtener mediciones'
    })
  }
}

// POST: Registrar medición
export const createHealthRecord = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const indicator = await HealthIndicator.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    })

    if (!indicator) {
      return res.status(404).json({
        message: 'Indicador no encontrado o inactivo'
      })
    }

    const isCheck = indicator.trackingType === 'check'
    const { value, secondaryValue, measuredAt, notes } = req.body

    if (!isCheck && (value === undefined || value === null || value === '')) {
      return res.status(400).json({
        message: 'El valor de la medición es obligatorio'
      })
    }

    const record = await HealthRecord.create({
      user: req.user._id,
      indicator: indicator._id,
      value: isCheck ? 1 : Number(value),
      secondaryValue: isCheck ? undefined : secondaryValue,
      measuredAt,
      notes
    })

    res.status(201).json(record)
  } catch (error) {
    console.error('createHealthRecord:', error.name)
    res.status(400).json({
      message: 'No se pudo registrar la medición'
    })
  }
}

// DELETE: Eliminar medición
export const deleteHealthRecord = async (req, res) => {
  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !mongoose.isValidObjectId(req.params.recordId)
  ) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.recordId,
      indicator: req.params.id,
      user: req.user._id
    })

    if (!record) {
      return res.status(404).json({
        message: 'Medición no encontrada'
      })
    }

    res.json({
      message: 'Medición eliminada correctamente'
    })
  } catch (error) {
    console.error('deleteHealthRecord:', error)
    res.status(500).json({
      message: 'Error al eliminar la medición'
    })
  }
}
