import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Registros from './pages/Registros'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/registros" element={<Registros />} />
            </Route>
          </Route>

          {/* Ruta inicial */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta inexistente */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
