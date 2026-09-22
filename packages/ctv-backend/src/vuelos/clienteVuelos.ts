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
