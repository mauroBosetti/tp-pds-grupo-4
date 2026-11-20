import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plane, LogOut, } from 'lucide-react'
import { useAuthAdministrador } from '@/auth/AuthAdministradorContext'
import { Button } from '@/components/ui/button'

const acciones = [
  { ruta: '/admin/consultas', etiqueta: 'Consultas' },
  { ruta: '/admin/agencias/nueva', etiqueta: 'Nueva agencia' },
  { ruta: '/admin/hoteles/nuevo', etiqueta: 'Hotel' },
]

export default function BarraDeNavegacionAdmin() {
  const { cerrarSesion } = useAuthAdministrador()
  const { pathname } = useLocation()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/admin/login')
  }

  return (
      <header className="border-b bg-background">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <span className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-semibold">
              <Plane className="size-4" />
              CTV Admin
            </span>
            <span className="flex items-center gap-2">
              {acciones.map(({ ruta, etiqueta }) => (
                <Button key={ruta} asChild size="sm" variant={pathname === ruta ? 'default' : 'outline'}>
                  <Link to={ruta}>{etiqueta}</Link>
                </Button>
              ))}
            </span>
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={salir}>
            <LogOut />
            Cerrar sesión
          </Button>
        </nav>
      </header>
  )
}
