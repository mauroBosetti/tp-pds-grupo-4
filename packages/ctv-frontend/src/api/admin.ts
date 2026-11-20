import { leerTokenAdministrador } from '@/auth/tokenAdministrador'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export class SinAutorizacion extends Error {}

function encabezadosAdmin(): HeadersInit {
  const token = leerTokenAdministrador()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchAdmin<T>(url: string): Promise<T> {
  const respuesta = await fetch(url, { headers: encabezadosAdmin() })
  if (respuesta.status === 401) {
    throw new SinAutorizacion('Sesión expirada')
  }
  if (!respuesta.ok) {
    throw new Error(`Error en la consulta: ${respuesta.statusText}`)
  }
  return respuesta.json()
}

export interface UsuarioRegistrado {
  id: string
  nombre: string
  email: string
  rol: 'cliente' | 'agencia' | 'administrador'
  agencia: string | null
}

export interface AgenciaRegistrada {
  id: string
  nombre: string
  codigoDeGrupo: string | null
}

export interface PaqueteDeInteres {
  usuarioClienteId: string
  paqueteId: string
  favorito: boolean
  usuarioCliente: {
    nombre: string
    cuenta: { email: string }
  }
  paquete: {
    id: string
    nombre: string
    destino: string
    precio: number
    agencia: { nombre: string }
  }
}

export interface OpinionDetalle {
  usuarioClienteId: string
  paqueteId: string
  puntaje: number | null
  comentario: string | null
  usuarioCliente: {
    nombre: string
    cuenta: { email: string }
  }
  paquete: {
    id: string
    nombre: string
    destino: string
    agencia: { id: string; nombre: string }
  }
}

export interface CompraRegistrada {
  id: string
  fecha: string
  usuarioCliente: {
    nombre: string
    cuenta: { email: string }
  }
  paquete: {
    id: string
    nombre: string
    precio: number
    destino: string
    agencia: { id: string; nombre: string }
  }
}

export interface ReportesUtilizacion {
  topCompradores: Array<{
    id: string
    nombre: string
    email: string
    cantidadCompras: number
  }>
  topDestinosRankeados: Array<{
    destino: string
    puntajePromedio: number
    cantidadOpiniones: number
  }>
  topAgencias: Array<{
    id: string
    nombre: string
    cantidadVentas: number
  }>
  topDestinosVendidos: Array<{
    destino: string
    cantidadVentas: number
  }>
}

export function obtenerUsuarios(): Promise<UsuarioRegistrado[]> {
  return fetchAdmin<UsuarioRegistrado[]>(`${API_URL}/api/user`)
}

export function obtenerAgencias(): Promise<AgenciaRegistrada[]> {
  return fetchAdmin<AgenciaRegistrada[]>(`${API_URL}/api/agencias`)
}

export function obtenerPaquetesDeInteres(): Promise<PaqueteDeInteres[]> {
  return fetchAdmin<PaqueteDeInteres[]>(`${API_URL}/api/review/favoritos`)
}

export function obtenerPuntajesYObservaciones(): Promise<OpinionDetalle[]> {
  return fetchAdmin<OpinionDetalle[]>(`${API_URL}/api/review`)
}

export function obtenerTodasLasCompras(): Promise<CompraRegistrada[]> {
  return fetchAdmin<CompraRegistrada[]>(`${API_URL}/api/compras/todas`)
}

export function obtenerReportes(): Promise<ReportesUtilizacion> {
  return fetchAdmin<ReportesUtilizacion>(`${API_URL}/api/report`)
}
