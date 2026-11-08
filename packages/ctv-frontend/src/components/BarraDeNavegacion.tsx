import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Plane } from 'lucide-react'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'

const enlacesDeCliente = [
  { ruta: '/catalogo', etiqueta: 'Catálogo' },
  { ruta: '/compras', etiqueta: 'Mis compras' },
]

const etiquetaDeRol = { agencia: 'Agencia', cliente: 'Cliente' } as const

export default function BarraDeNavegacion() {
  const { usuario, cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/login')
  }

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <span className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-semibold">
            <Plane className="size-4" />
            CTV
          </span>
          {usuario?.rol === 'cliente' &&
            enlacesDeCliente.map(({ ruta, etiqueta }) => (
              <NavLink
                key={ruta}
                to={ruta}
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}`
                }
              >
                {etiqueta}
              </NavLink>
            ))}
        </span>
        <span className="flex items-center gap-3 text-sm">
          {usuario && (
            <span className="flex flex-col items-end leading-tight">
              <span className="font-medium">{usuario.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {etiquetaDeRol[usuario.rol as keyof typeof etiquetaDeRol] ?? usuario.rol}
              </span>
            </span>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={salir}>
            <LogOut />
            Cerrar sesión
          </Button>
        </span>
      </nav>
    </header>
  )
}
