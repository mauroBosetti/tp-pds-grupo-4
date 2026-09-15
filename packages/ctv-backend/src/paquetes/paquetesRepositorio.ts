import { cliente } from '../db/cliente.js'

export interface DatosNuevoPaquete {
  nombre: string
  precio: number
  origen: string
  destino: string
  vueloIdaId: number
  vueloVueltaId: number
  agenciaId: string
}

export function crearPaquete(datos: DatosNuevoPaquete) {
  const { agenciaId, ...paquete } = datos
  return cliente.paquete.create({
    data: { ...paquete, agencia: { connect: { id: agenciaId } } },
  })
}

export function buscarPaquetesDeAgencia(agenciaId: string) {
  return cliente.paquete.findMany({ where: { agenciaId } })
}
