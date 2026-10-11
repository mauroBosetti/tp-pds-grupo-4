import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import { ApiVuelosNoDisponible, buscarVuelos, VentaRechazada } from '../vuelos/clienteVuelos.js'
import {
  registrarPaquete,
  obtenerPaquetesDeAgencia,
  obtenerCatalogoDePaquetes,
  comprarPaquete,
  PaqueteInexistente,
} from './paquetesServicio.js'
import { packageRouter } from './paquetesRutas.js'

vi.mock('./paquetesServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./paquetesServicio.js')>()
  return {
    ...real,
    registrarPaquete: vi.fn(),
    obtenerPaquetesDeAgencia: vi.fn(),
    obtenerCatalogoDePaquetes: vi.fn(),
    comprarPaquete: vi.fn(),
  }
})

vi.mock('../vuelos/clienteVuelos.js', async (importarReal) => {
  const real = await importarReal<typeof import('../vuelos/clienteVuelos.js')>()
  return { ...real, buscarVuelos: vi.fn() }
})

const registrar = vi.mocked(registrarPaquete)
const listar = vi.mocked(obtenerPaquetesDeAgencia)
const listarCatalogo = vi.mocked(obtenerCatalogoDePaquetes)
const buscar = vi.mocked(buscarVuelos)
const comprar = vi.mocked(comprarPaquete)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/package', packageRouter)
  return app
}

const agenciaId = 'ag-1';
const tokenAgencia = firmarToken({
  sub: 'cuenta-1',
  rol: 'agencia',
  nombre: 'Bruno',
  agenciaId
})
const tokenCliente = firmarToken({ sub: 'cuenta-3', rol: 'cliente', nombre: 'Clara' })
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
    registrar.mockResolvedValue({ id: 'p-1', ...paqueteValido, agenciaId })

    const respuesta = await request(crearApp())
      .post('/api/package')
      .set('Authorization', `Bearer ${tokenAgencia}`)
      .send(paqueteValido)

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ nombre: 'Escapada a Madrid' })
    expect(registrar).toHaveBeenCalledWith(expect.objectContaining(paqueteValido), agenciaId)
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
    listar.mockResolvedValue([{ id: 'p-1', ...paqueteValido, agenciaId }])

    const respuesta = await request(crearApp())
      .get('/api/package')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(1)
    expect(listar).toHaveBeenCalledWith(agenciaId)
  })
})

describe('GET /api/package/catalogo', () => {
  beforeEach(() => {
    listarCatalogo.mockReset()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/package/catalogo')

    expect(respuesta.status).toBe(401)
    expect(listarCatalogo).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de administrador', async () => {
    const respuesta = await request(crearApp())
      .get('/api/package/catalogo')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(respuesta.status).toBe(401)
    expect(listarCatalogo).not.toHaveBeenCalled()
  })

  it('devuelve los paquetes de todas las agencias con un token de agencia', async () => {
    listarCatalogo.mockResolvedValue([
      { id: 'p-1', ...paqueteValido, agenciaId, agencia: { id: agenciaId, nombre: 'Turismo Sur' } },
    ])

    const respuesta = await request(crearApp())
      .get('/api/package/catalogo')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(1)
    expect(listarCatalogo).toHaveBeenCalled()
  })

  it('devuelve los paquetes de todas las agencias con un token de cliente', async () => {
    const tokenCliente = firmarToken({ sub: 'cuenta-4', rol: 'cliente', nombre: 'Carlos' })
    listarCatalogo.mockResolvedValue([
      { id: 'p-1', ...paqueteValido, agenciaId, agencia: { id: agenciaId, nombre: 'Turismo Sur' } },
    ])

    const respuesta = await request(crearApp())
      .get('/api/package/catalogo')
      .set('Authorization', `Bearer ${tokenCliente}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toHaveLength(1)
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

describe('POST /api/package/:id/comprar', () => {
  beforeEach(() => {
    comprar.mockReset()
  })

  function comprarComoCliente() {
    return request(crearApp())
      .post('/api/package/p-1/comprar')
      .set('Authorization', `Bearer ${tokenCliente}`)
  }

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).post('/api/package/p-1/comprar')

    expect(respuesta.status).toBe(401)
    expect(comprar).not.toHaveBeenCalled()
  })

  it('responde 401 con un token de agencia', async () => {
    const respuesta = await request(crearApp())
      .post('/api/package/p-1/comprar')
      .set('Authorization', `Bearer ${tokenAgencia}`)

    expect(respuesta.status).toBe(401)
    expect(comprar).not.toHaveBeenCalled()
  })

  it('registra la compra a nombre del cliente del token', async () => {
    comprar.mockResolvedValue({ id_venta: 7, pasajero: 'Clara', ids_vuelo: [1, 2] })

    const respuesta = await comprarComoCliente()

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toEqual({ id_venta: 7, pasajero: 'Clara', ids_vuelo: [1, 2] })
    expect(comprar).toHaveBeenCalledWith('p-1', 'Clara')
  })

  it('responde 404 cuando el paquete no existe', async () => {
    comprar.mockRejectedValue(new PaqueteInexistente())

    const respuesta = await comprarComoCliente()

    expect(respuesta.status).toBe(404)
  })

  it('responde 409 con el motivo cuando un vuelo no tiene disponibilidad', async () => {
    comprar.mockRejectedValue(new VentaRechazada(409, 'El vuelo 2 no tiene disponibilidad'))

    const respuesta = await comprarComoCliente()

    expect(respuesta.status).toBe(409)
    expect(respuesta.body).toEqual({ error: 'El vuelo 2 no tiene disponibilidad' })
  })

  it('responde 502 cuando la API de vuelos no está disponible', async () => {
    comprar.mockRejectedValue(new ApiVuelosNoDisponible())

    const respuesta = await comprarComoCliente()

    expect(respuesta.status).toBe(502)
  })
})
