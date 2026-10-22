import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import {
  DatosDeOpinionInvalidos,
  PaqueteNoComprado,
  opinarSobrePaquete,
} from './opinionesServicio.js'
import { opinionesRouter } from './opinionesRutas.js'

vi.mock('./opinionesServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./opinionesServicio.js')>()
  return { ...real, opinarSobrePaquete: vi.fn() }
})

const opinar = vi.mocked(opinarSobrePaquete)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/review', opinionesRouter)
  return app
}

const tokenCliente = firmarToken({ sub: 'cuenta-3', rol: 'cliente', nombre: 'Clara' })
const tokenAgencia = firmarToken({ sub: 'cuenta-1', rol: 'agencia', nombre: 'Bruno', agenciaId: 'ag-1' })
const opinionGuardada = {
  usuarioClienteId: 'u-1',
  paqueteId: 'p-1',
  favorito: false,
  comentario: 'Genial',
  puntaje: 5,
}

describe('PUT /api/review/:paqueteId', () => {
  beforeEach(() => {
    opinar.mockReset()
  })

  function opinarComoCliente() {
    return request(crearApp())
      .put('/api/review/p-1')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ puntaje: 5, comentario: 'Genial' })
  }

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).put('/api/review/p-1').send({ puntaje: 5 })

    expect(respuesta.status).toBe(401)
    expect(opinar).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de agencia', async () => {
    const respuesta = await request(crearApp())
      .put('/api/review/p-1')
      .set('Authorization', `Bearer ${tokenAgencia}`)
      .send({ puntaje: 5 })

    expect(respuesta.status).toBe(401)
  })

  it('guarda la opinión de la cuenta del token y devuelve solo lo público', async () => {
    opinar.mockResolvedValue(opinionGuardada)

    const respuesta = await opinarComoCliente()

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual({ paqueteId: 'p-1', comentario: 'Genial', puntaje: 5 })
    expect(opinar).toHaveBeenCalledWith('cuenta-3', 'p-1', { puntaje: 5, comentario: 'Genial' })
  })

  it('responde 400 cuando la opinión es inválida', async () => {
    opinar.mockRejectedValue(new DatosDeOpinionInvalidos())

    expect((await opinarComoCliente()).status).toBe(400)
  })

  it('responde 403 cuando el cliente no compró el paquete', async () => {
    opinar.mockRejectedValue(new PaqueteNoComprado())

    expect((await opinarComoCliente()).status).toBe(403)
  })

  it('responde 404 cuando la cuenta no tiene un cliente', async () => {
    opinar.mockRejectedValue(new ClienteInexistente())

    expect((await opinarComoCliente()).status).toBe(404)
  })
})
