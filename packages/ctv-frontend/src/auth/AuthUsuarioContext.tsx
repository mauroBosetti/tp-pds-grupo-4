import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loginUsuario, type UsuarioSesion } from '@/api/autenticacion'
import {
  borrarTokenUsuario,
  borrarUsuario,
  guardarTokenUsuario,
  guardarUsuario,
  leerTokenUsuario,
  leerUsuario,
} from './tokenUsuario'

interface AuthUsuario {
  estaAutenticado: boolean
  usuario: UsuarioSesion | null
  iniciarSesion: (email: string, clave: string) => Promise<void>
  cerrarSesion: () => void
}

const ContextoAuthUsuario = createContext<AuthUsuario | null>(null)

export function AuthUsuarioProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerTokenUsuario())
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => leerUsuario())

  const valor = useMemo<AuthUsuario>(
    () => ({
      estaAutenticado: token !== null,
      usuario,
      async iniciarSesion(email, clave) {
        const resultado = await loginUsuario(email, clave)
        guardarTokenUsuario(resultado.token)
        guardarUsuario(resultado.usuario)
        setToken(resultado.token)
        setUsuario(resultado.usuario)
      },
      cerrarSesion() {
        borrarTokenUsuario()
        borrarUsuario()
        setToken(null)
        setUsuario(null)
      },
    }),
    [token, usuario],
  )

  return <ContextoAuthUsuario.Provider value={valor}>{children}</ContextoAuthUsuario.Provider>
}

export function useAuthUsuario(): AuthUsuario {
  const contexto = useContext(ContextoAuthUsuario)
  if (!contexto) {
    throw new Error('useAuthUsuario debe usarse dentro de AuthUsuarioProvider')
  }
  return contexto
}
