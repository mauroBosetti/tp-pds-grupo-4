import { leerTokenUsuario } from '@/auth/tokenUsuario'
import type { Opinion } from './opiniones'
import { SinAutorizacion, type PaqueteConAgencia } from './paquetes'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface Compra {
  id: string
  fecha: string
  paquete: PaqueteConAgencia
  opinion: Opinion | null
}

export async function listarMisCompras(): Promise<Compra[]> {
  const token = leerTokenUsuario()
  const respuesta = await fetch(`${API_URL}/api/compras`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las compras')
  }
  return respuesta.json()
}
