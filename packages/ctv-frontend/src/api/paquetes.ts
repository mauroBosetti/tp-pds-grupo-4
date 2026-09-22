import { leerTokenUsuario } from '@/auth/tokenUsuario'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface Vuelo {
  id_vuelo: number
  aerolinea: string
  origen: string
  destino: string
  fecha: string
  hora: string
  capacidad: number
  disponibilidad: number
}

export interface DatosNuevoPaquete {
  nombre: string
  precio: number
  origen: string
  destino: string
  vueloIdaId: number
  vueloVueltaId: number
}

export interface Paquete extends DatosNuevoPaquete {
  id: string
  agenciaId: string
}

export class SinAutorizacion extends Error {}

function encabezadosConToken(): HeadersInit {
  const token = leerTokenUsuario()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function listarPaquetes(): Promise<Paquete[]> {
  const respuesta = await fetch(`${API_URL}/package`, {
    headers: encabezadosConToken(),
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los paquetes')
  }
  return respuesta.json()
}

export async function buscarVuelos(origen: string, destino: string): Promise<Vuelo[]> {
  const parametros = new URLSearchParams({ origen, destino })
  const respuesta = await fetch(`${API_URL}/package/vuelos?${parametros}`, {
    headers: encabezadosConToken(),
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los vuelos')
  }
  return respuesta.json()
}

export async function crearPaquete(datos: DatosNuevoPaquete): Promise<Paquete> {
  const respuesta = await fetch(`${API_URL}/package`, {
    method: 'POST',
    headers: encabezadosConToken(),
    body: JSON.stringify(datos),
  })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error('No se pudo crear el paquete')
  }
  return respuesta.json()
}
