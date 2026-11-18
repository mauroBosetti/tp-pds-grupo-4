import { leerTokenAdministrador } from '@/auth/tokenAdministrador'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface Hotel {
  id: string
  nombre: string
  direccion: string
  pais: string
  ciudad: string
  imagen: string
}

export interface DatosNuevoHotel {
  nombre: string
  direccion: string
  pais: string
  ciudad: string
  imagen: string
}

export class SinAutorizacion extends Error {}

export async function crearHotel(datos: DatosNuevoHotel): Promise<Hotel> {
  const token = leerTokenAdministrador()
  const respuesta = await fetch(`${API_URL}/api/hoteles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(datos),
  })
  if (respuesta.status === 401) throw new SinAutorizacion('Sesión expirada')
  if (!respuesta.ok) throw new Error('No se pudo crear el hotel')
  return respuesta.json()
}
