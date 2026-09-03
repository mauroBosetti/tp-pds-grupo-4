import { afterEach, describe, expect, it } from 'vitest'
import {
  borrarTokenAdministrador,
  guardarTokenAdministrador,
  leerTokenAdministrador,
} from './tokenAdministrador'

describe('tokenAdministrador', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('devuelve null cuando no hay token guardado', () => {
    expect(leerTokenAdministrador()).toBeNull()
  })

  it('guarda y lee el token', () => {
    guardarTokenAdministrador('abc.123')

    expect(leerTokenAdministrador()).toBe('abc.123')
  })

  it('borra el token', () => {
    guardarTokenAdministrador('abc.123')

    borrarTokenAdministrador()

    expect(leerTokenAdministrador()).toBeNull()
  })
})
