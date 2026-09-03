import { cliente } from '../db/cliente.js'

export function buscarCuentaPorEmail(email: string) {
  return cliente.cuenta.findUnique({ where: { email } })
}
