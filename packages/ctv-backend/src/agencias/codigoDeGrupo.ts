import { randomInt } from 'node:crypto'

const CANTIDAD_DE_DIGITOS = 8

export function generarCodigoDeGrupo(): string {
  return String(randomInt(0, 10 ** CANTIDAD_DE_DIGITOS)).padStart(CANTIDAD_DE_DIGITOS, '0')
}
