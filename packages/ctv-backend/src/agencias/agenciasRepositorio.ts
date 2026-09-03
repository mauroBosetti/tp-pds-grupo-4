import { cliente } from '../db/cliente.js'

export function crearAgencia(nombre: string) {
  return cliente.agencia.create({ data: { nombre } })
}

export function buscarAgenciaPorId(id: string) {
  return cliente.agencia.findUnique({ where: { id } })
}
