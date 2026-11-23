
import { Bell, LogOut, ChevronDown, Leaf } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const currentHour = new Date().getHours()

  const greeting =
    currentHour < 12
      ? 'Buenos días'
      : currentHour < 19
        ? 'Buenas tardes'
        : 'Buenas noches'

  const today = format(
    new Date(),
    "EEEE d 'de' MMMM",
    { locale: es }
  )

  const userName = user?.name || 'Usuario'
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-[#E9E9E0] bg-white px-6 lg:px-8">

      {/* GREETING */}
      <div>
        <h2 className="text-lg font-semibold text-[#344B3A]">
          {greeting}, {userName.split(' ')[0]} 
        </h2>

        <p className="mt-1 text-xs capitalize text-gray-400">
          {today}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          aria-label="Notificaciones"
          title="Notificaciones próximamente"
          className="relative rounded-xl p-2.5 text-gray-500 transition hover:bg-[#F7F7F1] hover:text-[#344B3A]"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#D69B6D]" />
        </button>

        <div className="hidden h-8 w-px bg-[#E9E9E0] sm:block" />

        {/* USER */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6EEE4] text-sm font-semibold text-[#42634C]">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#344B3A]">
              {userName}
            </p>

            <p className="text-xs text-gray-400">
              Mi cuenta
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-gray-400 sm:block"
          />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="ml-1 rounded-xl p-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
        </button>

      </div>
    </header>
  )
}

export default Header
