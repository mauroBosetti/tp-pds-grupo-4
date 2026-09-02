import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loginAdministrador } from '@/api/autenticacion'
import {
  borrarTokenAdministrador,
  guardarTokenAdministrador,
  leerTokenAdministrador,
} from './tokenAdministrador'

interface AuthAdministrador {
  estaAutenticado: boolean
  iniciarSesion: (email: string, clave: string) => Promise<void>
  cerrarSesion: () => void
}

const ContextoAuthAdministrador = createContext<AuthAdministrador | null>(null)

export function AuthAdministradorProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerTokenAdministrador())

  const valor = useMemo<AuthAdministrador>(
    () => ({
      estaAutenticado: token !== null,
      async iniciarSesion(email, clave) {
        const { token: nuevoToken } = await loginAdministrador(email, clave)
        guardarTokenAdministrador(nuevoToken)
        setToken(nuevoToken)
      },
      cerrarSesion() {
        borrarTokenAdministrador()
        setToken(null)
      },
    }),
    [token],
  )

  return (
    <ContextoAuthAdministrador.Provider value={valor}>
      {children}
    </ContextoAuthAdministrador.Provider>
  )
}

export function useAuthAdministrador(): AuthAdministrador {
  const contexto = useContext(ContextoAuthAdministrador)
  if (!contexto) {
    throw new Error('useAuthAdministrador debe usarse dentro de AuthAdministradorProvider')
  }
  return contexto
}
