import { describe, expect, it } from 'vitest'
import { firmarToken, verificarToken } from './token.js'

describe('token', () => {
  it('firma un token que se puede verificar y conserva los datos', () => {
    const token = firmarToken({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })

    const datos = verificarToken(token)

    expect(datos.sub).toBe('cuenta-1')
    expect(datos.rol).toBe('administrador')
    expect(datos.nombre).toBe('Ada')
  })

  it('rechaza un token con formato inválido', () => {
    expect(() => verificarToken('no-es-un-token')).toThrow()
  })

  it('rechaza un token firmado con otro secreto', () => {
    const tokenAjeno =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ4In0.firma-invalida'

    expect(() => verificarToken(tokenAjeno)).toThrow()
  })
})
