import { crearAgencia, buscarAgenciaPorId } from './agenciasRepositorio.js'

export class NombreDeAgenciaInvalido extends Error {
  constructor() {
    super('El nombre de la agencia es requerido')
  }
}

function esNombreVacio(nombre: unknown): boolean {
  return typeof nombre !== 'string' || nombre.trim() === ''
}

export function registrarAgencia(nombre: unknown) {
  if (esNombreVacio(nombre)) {
    throw new NombreDeAgenciaInvalido()
  }
  return crearAgencia((nombre as string).trim())
}

export function obtenerAgencia(id: string) {
  return buscarAgenciaPorId(id)
}
