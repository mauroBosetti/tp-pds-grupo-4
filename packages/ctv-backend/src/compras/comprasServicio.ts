import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { buscarComprasDeCliente } from './comprasRepositorio.js'

export async function obtenerComprasDelCliente(cuentaId: string) {
  const usuarioCliente = await buscarUsuarioClientePorCuentaId(cuentaId)
  if (!usuarioCliente) {
    throw new ClienteInexistente()
  }
  return buscarComprasDeCliente(usuarioCliente.id)
}
