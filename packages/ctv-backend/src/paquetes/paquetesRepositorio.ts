import { cliente } from '../db/cliente.js'

export interface DatosNuevoPaquete {
  nombre: string
  precio: number
  origen: string
  destino: string
  vueloIdaId: number
  vueloVueltaId: number
  agenciaId: string
  hotelId: string
}

export function crearPaquete(datos: DatosNuevoPaquete) {
  const { agenciaId, hotelId, ...paquete } = datos
  return cliente.paquete.create({
    data: {
      ...paquete,
      agencia: { connect: { id: agenciaId } },
      hotel: { connect: { id: hotelId } },
    },
  })
}

export function buscarPaquetesDeAgencia(agenciaId: string) {
  return cliente.paquete.findMany({ where: { agenciaId } })
}

export function buscarTodosLosPaquetes() {
  return cliente.paquete.findMany({
    include: {
      agencia: { select: { id: true, nombre: true } },
      hotel: { select: { id: true, nombre: true, direccion: true, pais: true, ciudad: true, imagen: true } },
    },
  })
}

export function buscarPaquetePorId(id: string) {
  return cliente.paquete.findUnique({ where: { id } })
}

export function buscarPaqueteConAgencia(id: string) {
  return cliente.paquete.findUnique({
    where: { id },
    include: {
      agencia: { select: { id: true, nombre: true } },
      hotel: { select: { id: true, nombre: true, direccion: true, pais: true, ciudad: true, imagen: true } },
    },
  })
}
