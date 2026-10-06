import type { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requiereUsuario } from './requiereUsuario.js'
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

describe('requiereUsuario', () => {
  let next: NextFunction

  beforeEach(() => {
    next = vi.fn()
  })

  it('deja pasar con un token de cliente válido', () => {
    const token = firmarToken({ sub: 'cuenta-1', rol: 'cliente', nombre: 'Carlos' })
    const res = respuestaFalsa()

    requiereUsuario(peticionConEncabezado(`Bearer ${token}`), res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('deja pasar con un token de agencia válido', () => {
    const token = firmarToken({ sub: 'cuenta-2', rol: 'agencia', nombre: 'Bruno', agenciaId: 'ag-1' })
    const res = respuestaFalsa()

    requiereUsuario(peticionConEncabezado(`Bearer ${token}`), res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de administrador', () => {
    const token = firmarToken({ sub: 'cuenta-3', rol: 'administrador', nombre: 'Ada' })
    const res = respuestaFalsa()

    requiereUsuario(peticionConEncabezado(`Bearer ${token}`), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('responde 401 cuando no hay encabezado', () => {
    const res = respuestaFalsa()

    requiereUsuario(peticionConEncabezado(undefined), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('responde 401 con un token inválido', () => {
    const res = respuestaFalsa()

    requiereUsuario(peticionConEncabezado('Bearer basura'), res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
