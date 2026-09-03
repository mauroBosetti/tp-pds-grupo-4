import { cliente } from '../db/cliente.js'

export function buscarAdministradorPorCuentaId(cuentaId: string) {
  return cliente.usuarioAdministrador.findUnique({ where: { cuentaId } })
}
