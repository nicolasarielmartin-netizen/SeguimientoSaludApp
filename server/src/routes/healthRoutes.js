
import express from 'express'

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

router.use(authMiddleware)

router.get('/indicators', getIndicators)
router.post('/indicators', createIndicator)
router.put('/indicators/:id', updateIndicator)
router.delete('/indicators/:id', deleteIndicator)

router.get('/indicators/:id/records', getHealthRecords)
router.post('/indicators/:id/records', createHealthRecord)
router.delete('/indicators/:id/records/:recordId', deleteHealthRecord)

export default router
