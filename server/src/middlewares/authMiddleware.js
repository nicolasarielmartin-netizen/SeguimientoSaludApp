
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({
        message: 'No estás autenticado'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Usuario no autorizado'
      })
    }

    req.user = user

    next()

  } catch (error) {
    return res.status(401).json({
      message: 'Sesión inválida o expirada'
    })
  }
}

export default authMiddleware
