import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requiereAdministrador } from './requiereAdministrador.js'
import { firmarToken } from './token.js'

function respuestaFalsa() {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

function peticionConEncabezado(authorization?: string) {
  return { headers: { authorization } } as Request
}

describe('requiereAdministrador', () => {
  let next: NextFunction

  beforeEach(() => {
    next = vi.fn()
  })

  it('deja pasar con un token de administrador válido', () => {
    const token = firmarToken({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })
    const res = respuestaFalsa()

    requiereAdministrador(peticionConEncabezado(`Bearer ${token}`), res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('responde 401 cuando no hay encabezado', () => {
    const res = respuestaFalsa()

    requiereAdministrador(peticionConEncabezado(undefined), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('responde 401 con un token inválido', () => {
    const res = respuestaFalsa()

    requiereAdministrador(peticionConEncabezado('Bearer basura'), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
