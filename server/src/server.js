import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import symptomRoutes from './routes/symptomRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

dotenv.config()

const app = express()

// Middlewares generales
app.use(helmet())

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))


app.use(express.json())
app.use(cookieParser())

// Rutas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Cuidado Conciente API funcionando'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/symptoms', symptomRoutes)
app.use('/api/reports', reportRoutes)


// 404: ruta no encontrada (debe ir después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada'
  })
})

// Manejador de errores (debe tener los 4 parámetros, incluido next)
app.use((err, req, res, next) => {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'El cuerpo de la petición no es JSON válido'
    })
  }

  // Cualquier otro error: registra solo lo necesario, sin datos de salud
  console.error('Error no controlado:', err.message)

  return res.status(err.status || 500).json({
    message: err.status && err.status < 500
      ? err.message
      : 'Error interno del servidor'
  })
})

// Iniciar servidor
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`)
  })
}

startServer()
