import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { buscarOpinionesDeCliente } from '../opiniones/opinionesRepositorio.js'
import { buscarComprasDeCliente } from './comprasRepositorio.js'

export async function obtenerComprasDelCliente(cuentaId: string) {
  const usuarioCliente = await buscarUsuarioClientePorCuentaId(cuentaId)
  if (!usuarioCliente) {
    throw new ClienteInexistente()
  }
  const [compras, opiniones] = await Promise.all([
    buscarComprasDeCliente(usuarioCliente.id),
    buscarOpinionesDeCliente(usuarioCliente.id),
  ])
  return compras.map((compra) => {
    const opinion = opiniones.find(({ paqueteId }) => paqueteId === compra.paqueteId)
    return {
      ...compra,
      opinion: opinion ? { comentario: opinion.comentario, puntaje: opinion.puntaje } : null,
    }
  })
}
