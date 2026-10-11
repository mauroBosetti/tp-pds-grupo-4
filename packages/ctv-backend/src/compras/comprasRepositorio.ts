import { cliente } from '../db/cliente.js'

interface DatosNuevaCompra {
  usuarioClienteId: string
  paqueteId: string
}

export function crearCompra({ usuarioClienteId, paqueteId }: DatosNuevaCompra) {
  return cliente.compra.create({ data: { usuarioClienteId, paqueteId } })
}

export function buscarComprasDeCliente(usuarioClienteId: string) {
  return cliente.compra.findMany({
    where: { usuarioClienteId },
    orderBy: { fecha: 'desc' },
    include: { paquete: { include: { agencia: { select: { id: true, nombre: true } } } } },
  })
}

export async function clienteComproPaquete(usuarioClienteId: string, paqueteId: string) {
  const cantidad = await cliente.compra.count({ where: { usuarioClienteId, paqueteId } })
  return cantidad > 0
}
