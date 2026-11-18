import { crearHotel, buscarHotelPorId, DatosNuevoHotel } from './hotelesRepositorio.js'

export class DatosDeHotelInvalidos extends Error {
  constructor() {
    super('Todos los campos del hotel son requeridos y no pueden estar vacíos')
  }
}

function esCampoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === ''
}

function validarDatos(datos: unknown): DatosNuevoHotel {
  if (
    typeof datos !== 'object' ||
    datos === null ||
    esCampoVacio((datos as Record<string, unknown>).nombre) ||
    esCampoVacio((datos as Record<string, unknown>).direccion) ||
    esCampoVacio((datos as Record<string, unknown>).pais) ||
    esCampoVacio((datos as Record<string, unknown>).ciudad) ||
    esCampoVacio((datos as Record<string, unknown>).imagen)
  ) {
    throw new DatosDeHotelInvalidos()
  }
  const d = datos as Record<string, unknown>
  return {
    nombre: (d.nombre as string).trim(),
    direccion: (d.direccion as string).trim(),
    pais: (d.pais as string).trim(),
    ciudad: (d.ciudad as string).trim(),
    imagen: (d.imagen as string).trim(),
  }
}

export function registrarHotel(datos: unknown) {
  const datosValidos = validarDatos(datos)
  return crearHotel(datosValidos)
}

export function obtenerHotel(id: string) {
  return buscarHotelPorId(id)
}
