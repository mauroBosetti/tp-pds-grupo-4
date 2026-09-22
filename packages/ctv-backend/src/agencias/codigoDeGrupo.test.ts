import { describe, expect, it } from 'vitest'
import { generarCodigoDeGrupo } from './codigoDeGrupo.js'

describe('generarCodigoDeGrupo', () => {
  it('genera exactamente 8 dígitos', () => {
    for (let i = 0; i < 1000; i++) {
      expect(generarCodigoDeGrupo()).toMatch(/^\d{8}$/)
    }
  })
})
