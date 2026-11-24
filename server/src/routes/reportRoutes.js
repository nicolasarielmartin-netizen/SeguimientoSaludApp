import express from 'express'

import authMiddleware from '../middlewares/authMiddleware.js'
import { downloadHealthReport } from '../controllers/reportController.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/pdf', downloadHealthReport)

export default router
