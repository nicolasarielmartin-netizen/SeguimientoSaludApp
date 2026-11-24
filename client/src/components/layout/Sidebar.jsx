import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  Bell,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react'

import logo from '../../assets/Logo.png'

const menuItems = [
  {
    title: 'GENERAL',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true }
    ]
  },
  {
    title: 'SEGUIMIENTO',
    items: [
      { name: 'Registros', path: '/registros', icon: ClipboardList, enabled: true },
    ]
  },
  {
    title: 'ANÁLISIS',
    items: [
      { name: 'Informes', path: '/informes', icon: FileText, enabled: true }
    ]
  }
]

const Sidebar = () => {
  const allItems = menuItems.flatMap((section) => section.items)

  return (
    <>
      {/* ESCRITORIO: menú lateral */}
      <aside className="hidden h-screen w-70 shrink-0 flex-col border-r border-[#E9E9E0] bg-white lg:flex">

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
            <p className="text-xs text-gray-400">Tu compañero de bienestar</p>
          </div>
        </div>

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
                          {isActive && <ChevronRight size={16} />}
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

        <div className="border-t border-[#E9E9E0] p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-500 transition hover:bg-[#F7F7F1]">
            <Settings size={19} />
            <span className="text-sm font-medium">Configuración</span>
          </div>
        </div>
      </aside>

      {/* MÓVIL: barra fija al pie de la pantalla */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[#E9E9E0] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {allItems.map((item) => {
          const Icon = item.icon

          return item.enabled ? (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                  isActive ? 'text-[#344B3A]' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full ${
                      isActive ? 'bg-[#E6EEE4]' : ''
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ) : (
            <div
              key={item.path}
              aria-disabled="true"
              className="flex flex-1 cursor-not-allowed flex-col items-center gap-1 py-2 text-[11px] font-medium text-gray-300"
            >
              <span className="flex h-8 w-14 items-center justify-center">
                <Icon size={20} />
              </span>
              <span className="truncate">{item.name}</span>
            </div>
          )
        })}
      </nav>
    </>
  )
}

export default Sidebar
