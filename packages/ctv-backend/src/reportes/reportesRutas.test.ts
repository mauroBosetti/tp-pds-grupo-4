import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { firmarToken } from '../auth/token.js'
import {
  obtenerReporteCompleto,
  obtenerTopCompradores,
  obtenerTopDestinosRankeados,
  obtenerTopAgenciasConMasVentas,
  obtenerTopDestinosMasVendidos,
} from './reportesServicio.js'
import { reportRouter } from './reportesRutas.js'

vi.mock('./reportesServicio.js', () => ({
  obtenerReporteCompleto: vi.fn(),
  obtenerTopCompradores: vi.fn(),
  obtenerTopDestinosRankeados: vi.fn(),
  obtenerTopAgenciasConMasVentas: vi.fn(),
  obtenerTopDestinosMasVendidos: vi.fn(),
}))

const mockReporteCompleto = vi.mocked(obtenerReporteCompleto)
const mockTopCompradores = vi.mocked(obtenerTopCompradores)
const mockTopDestinosRankeados = vi.mocked(obtenerTopDestinosRankeados)
const mockTopAgencias = vi.mocked(obtenerTopAgenciasConMasVentas)
const mockTopDestinosVendidos = vi.mocked(obtenerTopDestinosMasVendidos)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/report', reportRouter)
  return app
}

const tokenAdmin = firmarToken({ sub: 'admin-1', rol: 'administrador', nombre: 'Ada' })
const tokenCliente = firmarToken({ sub: 'cliente-1', rol: 'cliente', nombre: 'Clara' })

describe('GET /api/report', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('responde 401 sin token', async () => {
    const respuesta = await request(crearApp()).get('/api/report')
    expect(respuesta.status).toBe(401)
  })

  it('responde 401 con token no administrador', async () => {
    const respuesta = await request(crearApp())
      .get('/api/report')
      .set('Authorization', `Bearer ${tokenCliente}`)
    expect(respuesta.status).toBe(401)
  })

  it('responde 200 con el reporte completo para administrador', async () => {
    const reporteMock = {
      topCompradores: [{ id: 'u1', nombre: 'Juan', email: 'j@a.com', cantidadCompras: 5 }],
      topDestinosRankeados: [{ destino: 'Cancún', puntajePromedio: 4.8, cantidadOpiniones: 10 }],
      topAgencias: [{ id: 'ag1', nombre: 'Turismo Sur', cantidadVentas: 8 }],
      topDestinosVendidos: [{ destino: 'Cancún', cantidadVentas: 15 }],
    }
    mockReporteCompleto.mockResolvedValue(reporteMock)

    const respuesta = await request(crearApp())
      .get('/api/report')
      .set('Authorization', `Bearer ${tokenAdmin}`)

    expect(respuesta.status).toBe(200)
    expect(respuesta.body).toEqual(reporteMock)
  })

  it('responde 200 para cada subreporte individual', async () => {
    mockTopCompradores.mockResolvedValue([])
    mockTopDestinosRankeados.mockResolvedValue([])
    mockTopAgencias.mockResolvedValue([])
    mockTopDestinosVendidos.mockResolvedValue([])

    const r1 = await request(crearApp())
      .get('/api/report/top-compradores')
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(r1.status).toBe(200)

    const r2 = await request(crearApp())
      .get('/api/report/top-destinos-rankeados')
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(r2.status).toBe(200)

    const r3 = await request(crearApp())
      .get('/api/report/top-agencias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(r3.status).toBe(200)

    const r4 = await request(crearApp())
      .get('/api/report/top-destinos-vendidos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
    expect(r4.status).toBe(200)
  })
})
