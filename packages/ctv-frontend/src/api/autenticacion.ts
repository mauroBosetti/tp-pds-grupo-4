// const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface AdministradorSesion {
  nombre: string
  email: string
}

export interface ResultadoLoginAdministrador {
  token: string
  administrador: AdministradorSesion
}

export class CredencialesInvalidas extends Error {}

export async function loginAdministrador(
  email: string,
  clave: string,
): Promise<ResultadoLoginAdministrador> {
  const respuesta = await fetch(`${API_URL}/api/auth/administrador/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, clave }),
  })
  if (respuesta.status === 401) {
    throw new CredencialesInvalidas('Email o contraseña incorrectos')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudo iniciar sesión')
  }
  return respuesta.json()
}
