import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { obtenerComprasDelCliente, obtenerTodasLasCompras } from './comprasServicio.js'
import { comprasRouter } from './comprasRutas.js'

vi.mock('./comprasServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./comprasServicio.js')>()
  return {
    ...real,
    obtenerComprasDelCliente: vi.fn(),
    obtenerTodasLasCompras: vi.fn(),
  }
})

const obtenerCompras = vi.mocked(obtenerComprasDelCliente)
const mockObtenerTodas = vi.mocked(obtenerTodasLasCompras)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/compras', comprasRouter)
  return app
}

const tokenCliente = firmarToken({ sub: 'cuenta-3', rol: 'cliente', nombre: 'Clara' })
const tokenAgencia = firmarToken({ sub: 'cuenta-1', rol: 'agencia', nombre: 'Bruno', agenciaId: 'ag-1' })
const tokenAdmin = firmarToken({ sub: 'cuenta-2', rol: 'administrador', nombre: 'Ada' })

describe('GET /api/compras/todas', () => {
  beforeEach(() => {
    mockObtenerTodas.mockReset()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/compras/todas')
    expect(respuesta.status).toBe(401)
  })

  it('responde 401 si no es administrador', async () => {
    const respuesta = await request(crearApp())
      .get('/api/compras/todas')
      .set('Authorization', `Bearer ${tokenCliente}`)
    expect(respuesta.status).toBe(401)
  })

  it('responde 200 con todas las compras para el administrador', async () => {
    mockObtenerTodas.mockResolvedValue([])

    const respuesta = await request(crearApp())
      .get('/api/compras/todas')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual([])
  })
})

describe('GET /api/compras', () => {
  beforeEach(() => {
    obtenerCompras.mockReset()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/compras')

    expect(respuesta.status).toBe(401)
    expect(obtenerCompras).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de agencia', async () => {
    const respuesta = await request(crearApp())
      .get('/api/compras')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(401)
    expect(obtenerCompras).not.toHaveBeenCalled()
  })

  it('lista las compras de la cuenta del token', async () => {
    obtenerCompras.mockResolvedValue([])

    const respuesta = await request(crearApp())
      .get('/api/compras')
      .set('Authorization', `Bearer ${tokenCliente}`)

    expect(respuesta.status).toBe(200)
    expect(obtenerCompras).toHaveBeenCalledWith('cuenta-3')
  })

  it('responde 404 cuando la cuenta no tiene un cliente', async () => {
    obtenerCompras.mockRejectedValue(new ClienteInexistente())

    const respuesta = await request(crearApp())
      .get('/api/compras')
      .set('Authorization', `Bearer ${tokenCliente}`)

    expect(respuesta.status).toBe(404)
  })
})
