import { cliente } from '../db/cliente.js'
import { generarCodigoDeGrupo } from './codigoDeGrupo.js'

const MAXIMO_DE_INTENTOS = 5

function esCodigoDuplicado(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}

export async function crearAgencia(nombre: string) {
  for (let intento = 0; intento < MAXIMO_DE_INTENTOS; intento++) {
    try {
      return await cliente.agencia.create({
        data: { nombre, codigoDeGrupo: generarCodigoDeGrupo() },
      })
    } catch (error) {
      if (!esCodigoDuplicado(error)) {
        throw error
      }
    }
  }
  throw new Error('No se pudo generar un código de grupo único')
}

export function buscarAgenciaPorId(id: string) {
  return cliente.agencia.findUnique({ where: { id } })
}

export function buscarAgenciaPorCodigo(codigoDeGrupo: string) {
  return cliente.agencia.findUnique({ where: { codigoDeGrupo } })
}
