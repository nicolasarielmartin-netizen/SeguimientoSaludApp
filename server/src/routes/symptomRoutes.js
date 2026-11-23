
import express from 'express'

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

router.use(authMiddleware)

router.get('/', getSymptoms)
router.post('/', createSymptom)
router.put('/:id', updateSymptom)
router.delete('/:id', deleteSymptom)

router.get('/:id/records', getSymptomRecords)
router.post('/:id/records', createSymptomRecord)
router.delete('/:id/records/:recordId', deleteSymptomRecord)

export default router
