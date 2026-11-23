import express from 'express'
import mongoose from 'mongoose'

import authMiddleware from '../middlewares/authMiddleware.js'

import {
  getIndicators,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getHealthRecords,
  createHealthRecord,
  deleteHealthRecord
} from '../controllers/healthController.js'

const router = express.Router()

// Valida los parámetros antes de llegar a los controladores
const validateObjectId = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({ message: 'Identificador no válido' })
  }
  next()
}

router.param('id', validateObjectId)
router.param('recordId', validateObjectId)

router.use(authMiddleware)

router.get('/indicators', getIndicators)
router.post('/indicators', createIndicator)
router.put('/indicators/:id', updateIndicator)
router.delete('/indicators/:id', deleteIndicator)

router.get('/indicators/:id/records', getHealthRecords)
router.post('/indicators/:id/records', createHealthRecord)
router.delete('/indicators/:id/records/:recordId', deleteHealthRecord)

export default router
