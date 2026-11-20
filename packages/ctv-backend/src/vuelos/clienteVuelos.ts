import { obtenerRequestId } from '../logging/contexto.js'
import { logger } from '../logging/logger.js'

const urlApiVuelos = process.env.API_VUELOS_URL ?? 'http://localhost:4001'

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

interface OpcionesDeLlamada {
  method?: string
  body?: string
}

function encabezadosDeSalida(opciones: OpcionesDeLlamada): Record<string, string> {
  const encabezados: Record<string, string> = {}
  if (opciones.body) {
    encabezados['Content-Type'] = 'application/json'
  }
  const requestId = obtenerRequestId()
  if (requestId) {
    encabezados['x-request-id'] = requestId
  }
  return encabezados
}

function nivelSegunEstado(estado: number) {
  if (estado >= 500) return 'error'
  if (estado >= 400) return 'warn'
  return 'info'
}

async function llamarApiVuelos(
  operacion: string,
  detalle: Record<string, unknown>,
  pedido: () => Promise<Response>,
) {
  const inicio = performance.now()
  const duracionMs = () => Math.round((performance.now() - inicio) * 10) / 10
  try {
    const respuesta = await pedido()
    const nivel = respuesta.status >= 500 ? 'error' : respuesta.status >= 400 ? 'warn' : 'info'
    logger[nivel](
      { operacion, estado: respuesta.status, duracionMs: duracionMs(), ...detalle },
      'llamada_api_vuelos',
    )
    return respuesta
  } catch (error) {
    logger.error({ err: error, operacion, duracionMs: duracionMs(), ...detalle }, 'llamada_api_vuelos_fallida')
    throw error
  }
}

export class ApiVuelosNoDisponible extends Error {
  constructor() {
    super('No se pudo consultar la API de vuelos')
  }
}

export async function buscarVuelos(origen: string, destino: string): Promise<Vuelo[]> {
  const parametros = new URLSearchParams({ origen, destino })
  try {
    const respuesta = await llamarApiVuelos('buscar_vuelos', { origen, destino }, 
      () => fetch(`${urlApiVuelos}/api/vuelos?${parametros}`)
    )
    if (!respuesta.ok) {
      throw new ApiVuelosNoDisponible()
    }
    return (await respuesta.json()) as Vuelo[]
  } catch (error) {
    if (error instanceof ApiVuelosNoDisponible) {
      throw error
    }
    throw new ApiVuelosNoDisponible()
  }
}

export class VentaRechazada extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje)
  }
}

export interface VentaDeVuelos {
  id_venta: number
  pasajero: string
  ids_vuelo: number[]
}

export async function venderVuelos(idsVuelo: number[], pasajero: string): Promise<VentaDeVuelos> {
  let respuesta: Response
  try {
    respuesta = await llamarApiVuelos('vender_vuelos', { idsVuelo }, 
      () => fetch(`${urlApiVuelos}/api/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids_vuelo: idsVuelo, pasajero }),
      }),
    )
  } catch {
    throw new ApiVuelosNoDisponible()
  }
  if (respuesta.ok) {
    return (await respuesta.json()) as VentaDeVuelos
  }
  if (respuesta.status >= 500) {
    throw new ApiVuelosNoDisponible()
  }
  const { error } = (await respuesta.json()) as { error: string }
  throw new VentaRechazada(respuesta.status, error)
}
