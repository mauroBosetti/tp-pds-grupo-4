import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { registrarAgencia } from '../agencias/agenciasServicio.js'
import {agencyRouter} from "../agencias/agenciasRutas";

vi.mock('../agencias/agenciasServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('../agencias/agenciasServicio.js')>()
  return { ...real, registrarAgencia: vi.fn(), obtenerAgencia: vi.fn() }
})

const registrar = vi.mocked(registrarAgencia)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/agencias', agencyRouter)
  return app
}

const tokenAdmin = firmarToken({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })

describe('POST /api/agencias', () => {
  beforeEach(() => {
    registrar.mockReset()
  })

  it('responde 401 y no crea la agencia sin token', async () => {
    const respuesta = await request(crearApp()).post('/api/agencias').send({ nombre: 'Turismo' })

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('responde 401 con un token inválido', async () => {
    const respuesta = await request(crearApp())
      .post('/api/agencias')
      .set('Authorization', 'Bearer basura')
      .send({ nombre: 'Turismo' })

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('crea la agencia con un token de administrador válido', async () => {
    registrar.mockResolvedValue({ id: 'a-1', nombre: 'Turismo', codigoDeGrupo: null })

    const respuesta = await request(crearApp())
      .post('/api/agencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Turismo' })

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ nombre: 'Turismo' })
    expect(registrar).toHaveBeenCalledWith('Turismo')
  })
})
