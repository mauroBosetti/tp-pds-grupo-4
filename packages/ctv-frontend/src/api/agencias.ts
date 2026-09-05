import { leerTokenAdministrador } from '@/auth/tokenAdministrador'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface Agencia {
  id: string
  nombre: string
  codigoDeGrupo: string | null
}

export class SinAutorizacion extends Error {}

export async function crearAgencia(nombre: string): Promise<Agencia> {
  const token = leerTokenAdministrador()
  const respuesta = await fetch(`${API_URL}/api/agencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ nombre }),
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudo crear la agencia')
  }
  return respuesta.json()
}

export async function obtenerAgencia(id: string): Promise<Agencia> {
  const respuesta = await fetch(`${API_URL}/api/agencias/${id}`)
  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la agencia')
  }
  return respuesta.json()
}
