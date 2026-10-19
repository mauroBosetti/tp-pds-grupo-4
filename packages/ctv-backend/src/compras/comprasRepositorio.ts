import { cliente } from '../db/cliente.js'

interface DatosNuevaCompra {
  usuarioClienteId: string
  paqueteId: string
}

export function crearCompra({ usuarioClienteId, paqueteId }: DatosNuevaCompra) {
  return cliente.compra.create({ data: { usuarioClienteId, paqueteId } })
}
