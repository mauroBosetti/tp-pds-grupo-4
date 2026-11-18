import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { registrarAgencia, obtenerAgencia, obtenerTodasLasAgencias } from './agenciasServicio.js'
import { agencyRouter } from './agenciasRutas.js'

vi.mock('./agenciasServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./agenciasServicio.js')>()
  return {
    ...real,
    registrarAgencia: vi.fn(),
    obtenerAgencia: vi.fn(),
    obtenerTodasLasAgencias: vi.fn(),
  }
})

const registrar = vi.mocked(registrarAgencia)
const obtenerTodas = vi.mocked(obtenerTodasLasAgencias)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/agencias', agencyRouter)
  return app
}

const tokenAdmin = firmarToken({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })

describe('GET /api/agencias', () => {
  beforeEach(() => {
    obtenerTodas.mockReset()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/agencias')
    expect(respuesta.status).toBe(401)
    expect(obtenerTodas).not.toHaveBeenCalled()
  })

  it('devuelve todas las agencias para un administrador', async () => {
    const agencias = [{ id: 'a-1', nombre: 'Turismo Sur', codigoDeGrupo: '12345678' }]
    obtenerTodas.mockResolvedValue(agencias)

    const respuesta = await request(crearApp())
      .get('/api/agencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual(agencias)
    expect(obtenerTodas).toHaveBeenCalled()
  })
})

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
    registrar.mockResolvedValue({ id: 'a-1', nombre: 'Turismo', codigoDeGrupo: '12345678' })

    const respuesta = await request(crearApp())
      .post('/api/agencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Turismo' })

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ nombre: 'Turismo', codigoDeGrupo: '12345678' })
    expect(registrar).toHaveBeenCalledWith('Turismo')
  })
})
