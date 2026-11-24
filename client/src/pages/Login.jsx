import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import logo from '../assets/Logo.png'

const inputClass =
  'w-full rounded-xl border border-[#E9E9E0] bg-white py-3 pl-10 pr-4 text-sm text-[#344B3A] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#789477]'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
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
      await login(formData)
      navigate('/dashboard')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'No se pudo iniciar sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F1] px-4">

      <div className="w-full max-w-md rounded-2xl border border-[#E9E9E0] bg-white p-8 shadow-sm">

        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Logo de Cuidado Conciente"
            className="mb-4 h-20 w-20 object-contain"
          />

          <h1 className="text-2xl font-semibold tracking-tight text-[#344B3A]">
            Cuidado Conciente
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Tu salud, bajo seguimiento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-[#687568]">
              Email
            </label>

            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-[#789477]"
                size={18}
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#687568]">
              Contraseña
            </label>

            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-[#789477]"
                size={18}
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#344B3A] py-3 text-sm font-medium text-white transition hover:bg-[#42634C] disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#42634C] hover:underline"
          >
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
