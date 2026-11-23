
import Symptom from '../models/Symptom.js'
import SymptomRecord from '../models/SymptomRecord.js'

// GET: Obtener síntomas
export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find({
      user: req.user._id
    }).sort({ createdAt: -1 })

    res.json(symptoms)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener síntomas'
    })
  }
}

// POST: Crear síntoma
export const createSymptom = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name?.trim()) {
      return res.status(400).json({
        message: 'El nombre del síntoma es obligatorio'
      })
    }

    const symptom = await Symptom.create({
      user: req.user._id,
      name,
      description
    })

    res.status(201).json(symptom)
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo crear el síntoma'
    })
  }
}

// PUT: Actualizar síntoma
export const updateSymptom = async (req, res) => {
  try {
    const { name, description, isActive } = req.body

    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({
        message: 'Síntoma no encontrado'
      })
    }

    if (name !== undefined) symptom.name = name
    if (description !== undefined) symptom.description = description
    if (isActive !== undefined) symptom.isActive = isActive

    await symptom.save()

    res.json(symptom)
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo actualizar el síntoma'
    })
  }
}

// DELETE: Eliminar síntoma
export const deleteSymptom = async (req, res) => {
  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({
        message: 'Síntoma no encontrado'
      })
    }

    await SymptomRecord.deleteMany({
      symptom: symptom._id,
      user: req.user._id
    })

    await symptom.deleteOne()

    res.json({
      message: 'Síntoma y sus registros eliminados correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar síntoma'
    })
  }
}

// GET: Obtener episodios de un síntoma
export const getSymptomRecords = async (req, res) => {
  try {
    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!symptom) {
      return res.status(404).json({
        message: 'Síntoma no encontrado'
      })
    }

    const records = await SymptomRecord.find({
      symptom: symptom._id,
      user: req.user._id
    }).sort({ recordedAt: -1 })

    res.json(records)
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener registros'
    })
  }
}

// POST: Registrar episodio
export const createSymptomRecord = async (req, res) => {
  try {
    const { frequency, intensity, recordedAt, notes } = req.body

    if (
      frequency === undefined ||
      !Number.isInteger(Number(frequency)) ||
      Number(frequency) < 1
    ) {
      return res.status(400).json({
        message: 'La frecuencia debe ser un entero mayor que cero'
      })
    }

    if (
      intensity === undefined ||
      !Number.isFinite(Number(intensity)) ||
      Number(intensity) < 0 ||
      Number(intensity) > 10
    ) {
      return res.status(400).json({
        message: 'La intensidad debe estar entre 0 y 10'
      })
    }

    const symptom = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true
    })

    if (!symptom) {
      return res.status(404).json({
        message: 'Síntoma no encontrado o inactivo'
      })
    }

    const record = await SymptomRecord.create({
      user: req.user._id,
      symptom: symptom._id,
      frequency,
      intensity,
      recordedAt,
      notes
    })

    res.status(201).json(record)
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo registrar el episodio'
    })
  }
}

// DELETE: Eliminar episodio
export const deleteSymptomRecord = async (req, res) => {
  try {
    const record = await SymptomRecord.findOneAndDelete({
      _id: req.params.recordId,
      symptom: req.params.id,
      user: req.user._id
    })

    if (!record) {
      return res.status(404).json({
        message: 'Episodio no encontrado'
      })
    }

    res.json({
      message: 'Episodio eliminado correctamente'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar episodio'
    })
  }
}
