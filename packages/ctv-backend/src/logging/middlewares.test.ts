import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { obtenerRequestId } from './contexto.js'
import { contextoDePeticion, manejarErrores } from './middleware.js'

function crearApp() {
  const app = express()
  app.use(contextoDePeticion)
  app.use(express.json())
  app.get('/id', (_req, res) => {
    res.json({ requestId: obtenerRequestId() })
  })
  app.post('/eco', (req, res) => {
    res.json(req.body)
  })
  app.get('/falla', async () => {
    throw new Error('detalle interno')
  })
  app.use(manejarErrores)
  return app
}

describe('contextoDePeticion', () => {
  it('genera un request id cuando no viene uno', async () => {
    const respuesta = await request(crearApp()).get('/id')

    expect(respuesta.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
    expect(respuesta.body.requestId).toBe(respuesta.headers['x-request-id'])
  })

  it('reutiliza el request id entrante', async () => {
    const respuesta = await request(crearApp()).get('/id').set('x-request-id', 'abc-123')

    expect(respuesta.headers['x-request-id']).toBe('abc-123')
    expect(respuesta.body.requestId).toBe('abc-123')
  })

  it('descarta un request id con formato inválido', async () => {
    const respuesta = await request(crearApp()).get('/id').set('x-request-id', 'a b;c')

    expect(respuesta.headers['x-request-id']).not.toBe('a b;c')
    expect(respuesta.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('manejarErrores', () => {
  it('responde 500 sin exponer el detalle del error', async () => {
    const respuesta = await request(crearApp()).get('/falla')

    expect(respuesta.status).toBe(500)
    expect(respuesta.body).toEqual({ error: 'Error interno del servidor' })
  })

  it('responde 400 ante un JSON mal formado', async () => {
    const respuesta = await request(crearApp())
      .post('/eco')
      .set('Content-Type', 'application/json')
      .send('{malo')

    expect(respuesta.status).toBe(400)
    expect(respuesta.body).toEqual({ error: 'Petición inválida' })
  })
})