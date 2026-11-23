
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si existe una sesión activa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me')
        setUser(response.data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login
  const login = async (credentials) => {
    const response = await api.post(
      '/auth/login',
      credentials
    )

    setUser(response.data.user)

    return response.data
  }

  // Registro
  const register = async (userData) => {
    const response = await api.post(
      '/auth/register',
      userData
    )

    setUser(response.data.user)

    return response.data
  }

  // Logout
  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
