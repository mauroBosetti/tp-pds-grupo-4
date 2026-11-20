import { cliente } from '../db/cliente.js'

export interface DatosNuevoHotel {
  nombre: string
  direccion: string
  pais: string
  ciudad: string
  imagen: string
}

export function crearHotel(datos: DatosNuevoHotel) {
  return cliente.hotel.create({ data: datos })
}

export function buscarHotelPorId(id: string) {
  return cliente.hotel.findUnique({ where: { id } })
}

export function buscarTodosLosHoteles() {
  return cliente.hotel.findMany({ orderBy: { nombre: 'asc' } })
}
