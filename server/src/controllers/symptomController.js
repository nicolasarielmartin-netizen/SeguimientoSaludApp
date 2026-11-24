import mongoose from 'mongoose'
import { z } from 'zod'
import Symptom from '../models/Symptom.js'
import SymptomRecord from '../models/SymptomRecord.js'

const symptomSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del malestar es obligatorio').max(60),
  description: z.string().trim().max(250).optional()
})

const symptomUpdateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del malestar es obligatorio').max(60).optional(),
  description: z.string().trim().max(250).optional(),
  isActive: z.boolean().optional()
})

const recordSchema = z.object({
  frequency: z.coerce.number().int('La frecuencia debe ser un entero').min(1, 'La frecuencia debe ser mayor que 0'),
  intensity: z.coerce.number().min(0, 'La intensidad debe estar entre 0 y 10').max(10, 'La intensidad debe estar entre 0 y 10'),
  recordedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional()
})

const invalidId = (res) =>
  res.status(400).json({ message: 'Identificador no válido' })

// GET: Listar malestares
export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.json(symptoms)
  } catch (error) {
    console.error('getSymptoms:', error)
    return res.status(500).json({ message: 'Error al obtener malestares' })
  }
}

// POST: Crear malestar
export const createSymptom = async (req, res) => {
  const parsed = symptomSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors
    })
  }

  try {
    const symptom = await Symptom.create({
      user: req.user._id,
      ...parsed.data
    })
    return res.status(201).json(symptom)
  } catch (error) {
    console.error('createSymptom:', error)
    return res.status(400).json({ message: 'No se pudo crear el malestar' })
  }
}

// PUT: Actualizar malestar
export const updateSymptom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res)

  const parsed = symptomUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors
    })
  }

  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({ message: 'malestar no encontrado' })
    }

    const { name, description, isActive } = parsed.data
    if (name !== undefined) symptom.name = name
    if (description !== undefined) symptom.description = description
    if (isActive !== undefined) symptom.isActive = isActive

    await symptom.save()
    return res.json(symptom)
  } catch (error) {
    console.error('updateSymptom:', error)
    return res.status(400).json({ message: 'No se pudo actualizar el malestar' })
  }
}

// DELETE: Eliminar malestar y sus episodios
export const deleteSymptom = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res)

  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({ message: 'malestar no encontrado' })
    }

    await SymptomRecord.deleteMany({
      symptom: symptom._id,
      user: req.user._id
    })
    await symptom.deleteOne()

    return res.json({ message: 'malestar y sus episodios eliminados correctamente' })
  } catch (error) {
    console.error('deleteSymptom:', error)
    return res.status(500).json({ message: 'Error al eliminar el malestar' })
  }
}

// GET: Episodios de un malestar
export const getSymptomRecords = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res)

  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({ message: 'malestar no encontrado' })
    }

    const records = await SymptomRecord.find({
      symptom: symptom._id,
      user: req.user._id
    }).sort({ recordedAt: -1 })

    return res.json(records)
  } catch (error) {
    console.error('getSymptomRecords:', error)
    return res.status(500).json({ message: 'Error al obtener episodios' })
  }
}

// POST: Registrar episodio
export const createSymptomRecord = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res)

  const parsed = recordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: parsed.error.flatten().fieldErrors
    })
  }

  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    })

    if (!symptom) {
      return res.status(404).json({ message: 'malestar no encontrado o inactivo' })
    }

    const record = await SymptomRecord.create({
      user: req.user._id,
      symptom: symptom._id,
      ...parsed.data
    })

    return res.status(201).json(record)
  } catch (error) {
    console.error('createSymptomRecord:', error)
    return res.status(400).json({ message: 'No se pudo registrar el episodio' })
  }
}

// DELETE: Eliminar episodio
export const deleteSymptomRecord = async (req, res) => {
  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !mongoose.isValidObjectId(req.params.recordId)
  ) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }

  try {
    const record = await SymptomRecord.findOneAndDelete({
      _id: req.params.recordId,
      symptom: req.params.id,
      user: req.user._id
    })

    if (!record) {
      return res.status(404).json({ message: 'Episodio no encontrado' })
    }

    return res.json({ message: 'Episodio eliminado correctamente' })
  } catch (error) {
    console.error('deleteSymptomRecord:', error)
    return res.status(500).json({ message: 'Error al eliminar el episodio' })
  }
}
