
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

import User from '../models/User.js'

// Validaciones
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nombre demasiado corto'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
})

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
})

// Configuración de cookie
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
}

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Datos públicos del usuario
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
})

// REGISTRO
export const register = async (req, res) => {
  const validation = registerSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: validation.error.flatten()
    })
  }

  const { name, email, password } = validation.data

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    return res.status(409).json({
      message: 'El email ya está registrado'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  })

  const token = generateToken(user._id)

  res.cookie('token', token, cookieOptions)

  return res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: publicUser(user)
  })
}

// LOGIN
export const login = async (req, res) => {
  const validation = loginSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      message: 'Credenciales inválidas'
    })
  }

  const { email, password } = validation.data

  const user = await User.findOne({ email }).select('+password')

  if (!user || !user.isActive) {
    return res.status(401).json({
      message: 'Email o contraseña incorrectos'
    })
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  )

  if (!passwordMatch) {
    return res.status(401).json({
      message: 'Email o contraseña incorrectos'
    })
  }

  const token = generateToken(user._id)

  res.cookie('token', token, cookieOptions)

  return res.json({
    message: 'Inicio de sesión correcto',
    user: publicUser(user)
  })
}

// USUARIO ACTUAL
export const getMe = async (req, res) => {
  return res.json({
    user: publicUser(req.user)
  })
}

// LOGOUT
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return res.json({
    message: 'Sesión cerrada correctamente'
  })
}

const indicatorSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.string().trim().max(40).optional(),
  unit: z.string().trim().min(1).max(20),
  description: z.string().trim().max(250).optional()
})

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
    res.status(201).json(indicator)
  } catch (error) {
    console.error('createIndicator:', error)
    res.status(500).json({ message: 'Error al crear el indicador' })
  }
}
