import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  loginAgencia,
  loginCliente,
  type ResultadoLoginUsuario,
  type UsuarioSesion,
} from '@/api/autenticacion'
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
  iniciarSesionAgencia: (email: string, clave: string) => Promise<void>
  iniciarSesionCliente: (email: string, clave: string) => Promise<void>
  iniciarSesion: (email: string, clave: string, tipo?: 'agencia' | 'cliente') => Promise<void>
  cerrarSesion: () => void
}

const ContextoAuthUsuario = createContext<AuthUsuario | null>(null)

export function AuthUsuarioProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => leerTokenUsuario())
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => leerUsuario())

  function aplicarSesion(resultado: ResultadoLoginUsuario) {
    guardarTokenUsuario(resultado.token)
    guardarUsuario(resultado.usuario)
    setToken(resultado.token)
    setUsuario(resultado.usuario)
  }

  const valor = useMemo<AuthUsuario>(
    () => ({
      estaAutenticado: token !== null,
      usuario,
      async iniciarSesionAgencia(email, clave) {
        const resultado = await loginAgencia(email, clave)
        aplicarSesion(resultado)
      },
      async iniciarSesionCliente(email, clave) {
        const resultado = await loginCliente(email, clave)
        aplicarSesion(resultado)
      },
      async iniciarSesion(email, clave, tipo = 'agencia') {
        const resultado =
          tipo === 'cliente'
            ? await loginCliente(email, clave)
            : await loginAgencia(email, clave)
        aplicarSesion(resultado)
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
