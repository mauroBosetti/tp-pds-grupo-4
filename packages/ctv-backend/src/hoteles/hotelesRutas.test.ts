import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { registrarHotel, obtenerHotel } from './hotelesServicio.js'
import { hotelesRouter } from './hotelesRutas.js'

vi.mock('./hotelesServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./hotelesServicio.js')>()
  return { ...real, registrarHotel: vi.fn(), obtenerHotel: vi.fn() }
})

const registrar = vi.mocked(registrarHotel)
const obtener = vi.mocked(obtenerHotel)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/hoteles', hotelesRouter)
  return app
}

const tokenAdmin = firmarToken({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })

const datosHotel = {
  nombre: 'Hotel Central',
  direccion: 'Av. Siempreviva 742',
  pais: 'Argentina',
  ciudad: 'Buenos Aires',
  imagen: 'https://example.com/hotel.jpg',
}

describe('POST /api/hoteles', () => {
  beforeEach(() => {
    registrar.mockReset()
  })

  it('responde 401 y no crea el hotel sin token', async () => {
    const respuesta = await request(crearApp()).post('/api/hoteles').send(datosHotel)

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('responde 401 con un token inválido', async () => {
    const respuesta = await request(crearApp())
      .post('/api/hoteles')
      .set('Authorization', 'Bearer basura')
      .send(datosHotel)

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('responde 400 con datos inválidos', async () => {
    const { DatosDeHotelInvalidos } = await import('./hotelesServicio.js')
    registrar.mockRejectedValue(new DatosDeHotelInvalidos())

    const respuesta = await request(crearApp())
      .post('/api/hoteles')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: '' })

    expect(respuesta.status).toBe(400)
  })

  it('crea el hotel con un token de administrador válido', async () => {
    const hotelCreado = { id: 'h-1', ...datosHotel }
    registrar.mockResolvedValue(hotelCreado)

    const respuesta = await request(crearApp())
      .post('/api/hoteles')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(datosHotel)

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject(hotelCreado)
    expect(registrar).toHaveBeenCalledWith(datosHotel)
  })
})

describe('GET /api/hoteles/:id', () => {
  beforeEach(() => {
    obtener.mockReset()
  })

  it('responde 404 si el hotel no existe', async () => {
    obtener.mockResolvedValue(null)

    const respuesta = await request(crearApp()).get('/api/hoteles/h-inexistente')

    expect(respuesta.status).toBe(404)
  })

  it('responde 200 con el hotel si existe', async () => {
    const hotelCreado = { id: 'h-1', ...datosHotel }
    obtener.mockResolvedValue(hotelCreado)

    const respuesta = await request(crearApp()).get('/api/hoteles/h-1')

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toMatchObject(hotelCreado)
  })
})
