import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { obtenerComprasDelCliente } from './comprasServicio.js'
import { comprasRouter } from './comprasRutas.js'

vi.mock('./comprasServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./comprasServicio.js')>()
  return { ...real, obtenerComprasDelCliente: vi.fn() }
})

const obtenerCompras = vi.mocked(obtenerComprasDelCliente)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/compras', comprasRouter)
  return app
}

const tokenCliente = firmarToken({ sub: 'cuenta-3', rol: 'cliente', nombre: 'Clara' })
const tokenAgencia = firmarToken({ sub: 'cuenta-1', rol: 'agencia', nombre: 'Bruno', agenciaId: 'ag-1' })

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
