import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { buscarVuelos } from '../vuelos/clienteVuelos.js'
import { registrarPaquete, obtenerPaquetesDeAgencia } from './paquetesServicio.js'
import { packageRouter } from './paquetesRutas.js'

vi.mock('./paquetesServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./paquetesServicio.js')>()
  return { ...real, registrarPaquete: vi.fn(), obtenerPaquetesDeAgencia: vi.fn() }
})

vi.mock('../vuelos/clienteVuelos.js', async (importarReal) => {
  const real = await importarReal<typeof import('../vuelos/clienteVuelos.js')>()
  return { ...real, buscarVuelos: vi.fn() }
})

const registrar = vi.mocked(registrarPaquete)
const listar = vi.mocked(obtenerPaquetesDeAgencia)
const buscar = vi.mocked(buscarVuelos)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/package', packageRouter)
  return app
}

const tokenAgencia = firmarToken({
  sub: 'cuenta-1',
  rol: 'agencia',
  nombre: 'Bruno',
  agenciaId: 'ag-1',
})
const tokenAdmin = firmarToken({ sub: 'cuenta-2', rol: 'administrador', nombre: 'Ada' })

const paqueteValido = {
  nombre: 'Escapada a Madrid',
  precio: 1500,
  origen: 'Buenos Aires',
  destino: 'Madrid',
  vueloIdaId: 1,
  vueloVueltaId: 2,
}

describe('POST /api/package', () => {
  beforeEach(() => {
    registrar.mockReset()
  })

  it('responde 401 y no crea el paquete sin token', async () => {
    const respuesta = await request(crearApp()).post('/api/package').send(paqueteValido)

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de administrador', async () => {
    const respuesta = await request(crearApp())
      .post('/api/package')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(paqueteValido)

    expect(respuesta.status).toBe(401)
    expect(registrar).not.toHaveBeenCalled()
  })

  it('crea el paquete con un token de agencia válido', async () => {
    registrar.mockResolvedValue({ id: 'p-1', ...paqueteValido, agenciaId: 'ag-1' })

    const respuesta = await request(crearApp())
      .post('/api/package')
      .set('Authorization', `Bearer ${tokenAgencia}`)
      .send(paqueteValido)

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ nombre: 'Escapada a Madrid' })
    expect(registrar).toHaveBeenCalledWith(expect.objectContaining(paqueteValido), 'ag-1')
  })
})

describe('GET /api/package', () => {
  beforeEach(() => {
    listar.mockReset()
  })

  it('responde 401 sin token de agencia', async () => {
    const respuesta = await request(crearApp()).get('/api/package')

    expect(respuesta.status).toBe(401)
    expect(listar).not.toHaveBeenCalled()
  })

  it('lista los paquetes de la agencia del token', async () => {
    listar.mockResolvedValue([{ id: 'p-1', ...paqueteValido, agenciaId: 'ag-1' }])

    const respuesta = await request(crearApp())
      .get('/api/package')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(1)
    expect(listar).toHaveBeenCalledWith('ag-1')
  })
})

describe('GET /api/package/vuelos', () => {
  beforeEach(() => {
    buscar.mockReset()
  })

  it('responde 401 sin token de agencia', async () => {
    const respuesta = await request(crearApp()).get('/api/package/vuelos?origen=A&destino=B')

    expect(respuesta.status).toBe(401)
    expect(buscar).not.toHaveBeenCalled()
  })

  it('devuelve los vuelos que trae la API para el origen y destino', async () => {
    buscar.mockResolvedValue([
      {
        id_vuelo: 1,
        aerolinea: 'Aerolíneas Argentinas',
        origen: 'Buenos Aires',
        destino: 'Madrid',
        fecha: '2027-07-01',
        hora: '10:00:00',
        capacidad: 150,
        disponibilidad: 100,
      },
    ])

    const respuesta = await request(crearApp())
      .get('/api/package/vuelos?origen=Buenos Aires&destino=Madrid')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(1)
    expect(buscar).toHaveBeenCalledWith('Buenos Aires', 'Madrid')
  })
})
