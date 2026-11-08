import { clienteComproPaquete } from '../compras/comprasRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { guardarOpinion } from './opinionesRepositorio.js'

export const PUNTAJE_MINIMO = 1
export const PUNTAJE_MAXIMO = 5

export class DatosDeOpinionInvalidos extends Error {
  constructor() {
    super(`La opinión necesita un puntaje entero de ${PUNTAJE_MINIMO} a ${PUNTAJE_MAXIMO} o un comentario`)
  }
}

export class PaqueteNoComprado extends Error {
  constructor() {
    super('Solo podés opinar sobre paquetes que compraste')
  }
}

export interface DatosOpinionSolicitada {
  comentario?: unknown
  puntaje?: unknown
}

function esPuntajeValido(valor: unknown): valor is number {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= PUNTAJE_MINIMO &&
    valor <= PUNTAJE_MAXIMO
  )
}

function estaAusente(valor: unknown): boolean {
  return valor === undefined || valor === null
}

function normalizarOpinion({ comentario, puntaje }: DatosOpinionSolicitada) {
  const puntajeInvalido = !estaAusente(puntaje) && !esPuntajeValido(puntaje)
  const comentarioInvalido = !estaAusente(comentario) && typeof comentario !== 'string'
  if (puntajeInvalido || comentarioInvalido) {
    throw new DatosDeOpinionInvalidos()
  }
  const comentarioLimpio = typeof comentario === 'string' ? comentario.trim() || null : null
  const puntajeNormalizado = esPuntajeValido(puntaje) ? puntaje : null
  if (comentarioLimpio === null && puntajeNormalizado === null) {
    throw new DatosDeOpinionInvalidos()
  }
  return { comentario: comentarioLimpio, puntaje: puntajeNormalizado }
}

export async function opinarSobrePaquete(
  cuentaId: string,
  paqueteId: string,
  datos: DatosOpinionSolicitada,
) {
  const opinion = normalizarOpinion(datos)
  const usuarioCliente = await buscarUsuarioClientePorCuentaId(cuentaId)
  if (!usuarioCliente) {
    throw new ClienteInexistente()
  }
  if (!(await clienteComproPaquete(usuarioCliente.id, paqueteId))) {
    throw new PaqueteNoComprado()
  }
  return guardarOpinion({ usuarioClienteId: usuarioCliente.id, paqueteId, ...opinion })
}
