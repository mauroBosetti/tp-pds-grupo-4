import { Router } from 'express'
import { requiereAdministrador } from '../auth/requiereAdministrador.js'
import {
  obtenerReporteCompleto,
  obtenerTopCompradores,
  obtenerTopDestinosRankeados,
  obtenerTopAgenciasConMasVentas,
  obtenerTopDestinosMasVendidos,
} from './reportesServicio.js'

const reportRouter: Router = Router()

reportRouter.get('/', requiereAdministrador, async (_req, res) => {
  const reporte = await obtenerReporteCompleto()
  res.json(reporte)
})

reportRouter.get('/top-compradores', requiereAdministrador, async (_req, res) => {
  const reporte = await obtenerTopCompradores()
  res.json(reporte)
})

reportRouter.get('/top-destinos-rankeados', requiereAdministrador, async (_req, res) => {
  const reporte = await obtenerTopDestinosRankeados()
  res.json(reporte)
})

reportRouter.get('/top-agencias', requiereAdministrador, async (_req, res) => {
  const reporte = await obtenerTopAgenciasConMasVentas()
  res.json(reporte)
})

reportRouter.get('/top-destinos-vendidos', requiereAdministrador, async (_req, res) => {
  const reporte = await obtenerTopDestinosMasVendidos()
  res.json(reporte)
})

export { reportRouter }
