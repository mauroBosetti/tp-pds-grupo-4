import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { obtenerUsuariosRegistrados } from './usuariosServicio.js'
import { userRouter } from './usuariosRutas.js'

vi.mock('./usuariosServicio.js', () => ({
  obtenerUsuariosRegistrados: vi.fn(),
}))

const mockObtenerUsuarios = vi.mocked(obtenerUsuariosRegistrados)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/user', userRouter)
  return app
}

const tokenAdmin = firmarToken({ sub: 'admin-1', rol: 'administrador', nombre: 'Ada' })
const tokenCliente = firmarToken({ sub: 'cliente-1', rol: 'cliente', nombre: 'Clara' })

describe('GET /api/user', () => {
  beforeEach(() => {
    mockObtenerUsuarios.mockReset()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/user')
    expect(respuesta.status).toBe(401)
  })

  it('responde 401 con token no administrador', async () => {
    const respuesta = await request(crearApp())
      .get('/api/user')
      .set('Authorization', `Bearer ${tokenCliente}`)
    expect(respuesta.status).toBe(401)
  })

  it('responde 200 con la lista de usuarios para administrador', async () => {
    const usuariosMock = [
      { id: '1', nombre: 'Clara', email: 'c@a.com', rol: 'cliente' as const, agencia: null },
      { id: '2', nombre: 'Bruno', email: 'b@a.com', rol: 'agencia' as const, agencia: 'Turismo Sur' },
    ]
    mockObtenerUsuarios.mockResolvedValue(usuariosMock)

    const respuesta = await request(crearApp())
      .get('/api/user')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual(usuariosMock)
    expect(mockObtenerUsuarios).toHaveBeenCalled()
  })
})
