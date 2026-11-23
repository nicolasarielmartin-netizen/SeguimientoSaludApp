
import express from 'express'

import {
  register,
  login,
  getMe,
  logout
} from '../controllers/authController.js'

import authMiddleware from '../middlewares/authMiddleware.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe)


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false
})
router.post('/login', loginLimiter, login)


export default router
