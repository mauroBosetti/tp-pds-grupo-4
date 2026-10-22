import { leerTokenUsuario } from '@/auth/tokenUsuario'
import { SinAutorizacion } from './paquetes'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export const PUNTAJE_MINIMO = 1
export const PUNTAJE_MAXIMO = 5

export interface Opinion {
  comentario: string | null
  puntaje: number | null
}

export interface DatosOpinion {
  comentario?: string
  puntaje?: number
}

export async function guardarOpinion(paqueteId: string, datos: DatosOpinion): Promise<Opinion> {
  const token = leerTokenUsuario()
  const respuesta = await fetch(`${API_URL}/api/review/${paqueteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(datos),
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    const { error } = await respuesta.json().catch(() => ({ error: undefined }))
    throw new Error(error ?? 'No se pudo guardar la opinión')
  }
  return respuesta.json()
}
