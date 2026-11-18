import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, Building2 } from 'lucide-react'
import { useAuthAdministrador } from '@/auth/AuthAdministradorContext'
import { Button } from '@/components/ui/button'

export default function BarraDeNavegacionAdmin() {
  const { cerrarSesion } = useAuthAdministrador()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/admin/login')
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <span className="flex items-center gap-6">
          <NavLink to="/admin" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5 text-primary" />
            <span>CTV Admin</span>
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `transition-colors ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }
            >
              Consultas y Reportes
            </NavLink>
            <NavLink
              to="/admin/agencias/nueva"
              className={({ isActive }) =>
                `flex items-center gap-1 transition-colors ${isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }
            >
              <Building2 className="size-3.5" />
              Nueva Agencia
            </NavLink>
          </div>
        </span>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={salir}>
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </nav>
    </header>
  )
}
