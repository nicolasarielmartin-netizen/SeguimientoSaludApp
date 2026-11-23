
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(formData)
      navigate('/dashboard')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'No se pudo completar el registro'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

        <div className="flex flex-col items-center mb-8">

          <HeartPulse size={42} className="text-teal-600 mb-3" />

          <h1 className="text-2xl font-bold text-slate-800">
            Crear cuenta
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Comenzá a realizar tu seguimiento de salud
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre completo
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="María González"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register
