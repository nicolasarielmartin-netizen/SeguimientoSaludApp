import express from 'express'
import mongoose from 'mongoose'

import authMiddleware from '../middlewares/authMiddleware.js'
import {
  getSymptoms,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getSymptomRecords,
  createSymptomRecord,
  deleteSymptomRecord
} from '../controllers/symptomController.js'

const router = express.Router()

// Valida los parámetros antes de llegar a cualquier controlador
const validateObjectId = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }
  next()
}

router.param('id', validateObjectId)
router.param('recordId', validateObjectId)

router.use(authMiddleware)

router.get('/', getSymptoms)
router.post('/', createSymptom)
router.put('/:id', updateSymptom)
router.delete('/:id', deleteSymptom)

router.get('/:id/records', getSymptomRecords)
router.post('/:id/records', createSymptomRecord)
router.delete('/:id/records/:recordId', deleteSymptomRecord)

export default router
