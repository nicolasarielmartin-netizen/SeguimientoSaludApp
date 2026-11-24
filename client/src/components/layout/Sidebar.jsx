import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  Bell,
  FileText,
  Settings,
  Leaf,
  ChevronRight
} from 'lucide-react'
import logo from '../../assets/Logo.png'

const Sidebar = () => {
  const menuItems = [
    {
      title: 'GENERAL',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          enabled: true
        }
      ]
    },
    {
      title: 'SEGUIMIENTO',
      items: [
        {
          name: 'Registros',
          path: '/registros',
          icon: ClipboardList,
          enabled: true
        },
        {
          name: 'Hábitos',
          path: '/habitos',
          icon: Heart,
          enabled: false
        },
        {
          name: 'Notificaciones',
          path: '/notificaciones',
          icon: Bell,
          enabled: false
        }
      ]
    },
    {
      title: 'ANÁLISIS',
      items: [
        {
          name: 'Informes',
          path: '/informes',
          icon: FileText,
          enabled: true
        }
      ]
    }
  ]

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[#E9E9E0] bg-white">

      {/* LOGO */}
      <div className="flex h-20 items-center gap-3 border-b border-[#E9E9E0] px-6">
        <img
          src={logo}
          alt="Logo de Cuidado Conciente"
          className="h-10 w-10 rounded-xl object-contain"
        />

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#344B3A]">
            Cuidado Conciente
          </h1>
          <p className="text-xs text-gray-400">
            Tu seguimiento personal
          </p>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">

        {menuItems.map((section) => (
          <div key={section.title}>
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return item.enabled ? (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#E6EEE4] text-[#344B3A]'
                          : 'text-gray-500 hover:bg-[#F7F7F1] hover:text-[#344B3A]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon size={19} />
                          <span>{item.name}</span>
                        </div>

                        {isActive && (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </NavLink>
                ) : (
                  <div
                    key={item.path}
                    title="Próximamente"
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-gray-400 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={19} />
                      <span>{item.name}</span>
                    </div>

                    <span className="text-[9px] font-semibold uppercase tracking-wider">
                      Próximamente
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      </nav>

      {/* FOOTER */}
      <div className="border-t border-[#E9E9E0] p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-500 transition hover:bg-[#F7F7F1]">
          <Settings size={19} />
          <span className="text-sm font-medium">Configuración</span>
        </div>

        <div className="mt-3 rounded-xl bg-[#F5F0E6] p-4">
          <div className="flex items-center gap-2 text-[#766B58]">
            <Heart size={16} />
            <span className="text-xs font-semibold">
              Tu bienestar importa
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[#887E6C]">
            Pequeños hábitos, grandes cambios.
          </p>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
