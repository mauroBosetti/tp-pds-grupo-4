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

export class ApiVuelosNoDisponible extends Error {
  constructor() {
    super('No se pudo consultar la API de vuelos')
  }
}

export async function buscarVuelos(origen: string, destino: string): Promise<Vuelo[]> {
  const parametros = new URLSearchParams({ origen, destino })
  try {
    const respuesta = await fetch(`${urlApiVuelos}/api/vuelos?${parametros}`)
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
    respuesta = await fetch(`${urlApiVuelos}/api/venta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids_vuelo: idsVuelo, pasajero }),
    })
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
