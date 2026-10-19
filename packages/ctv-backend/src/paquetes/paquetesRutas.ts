import { Router } from 'express'
import { requiereAgencia } from '../auth/requiereAgencia.js'
import { requiereCliente } from '../auth/requiereCliente.js'
import { requiereUsuario } from '../auth/requiereUsuario.js'
import { buscarVuelos, ApiVuelosNoDisponible, VentaRechazada } from '../vuelos/clienteVuelos.js'
import {
  registrarPaquete,
  obtenerPaquetesDeAgencia,
  obtenerCatalogoDePaquetes,
  comprarPaquete,
  DatosDePaqueteInvalidos,
  PaqueteInexistente,
  ClienteInexistente,
} from './paquetesServicio.js'

const packageRouter: Router = Router()

packageRouter.get('/', requiereAgencia, async (req, res) => {
  const agenciaId = req.usuario?.agenciaId
  if (!agenciaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  const paquetes = await obtenerPaquetesDeAgencia(agenciaId)
  res.json(paquetes)
})

packageRouter.get('/catalogo', requiereUsuario, async (_req, res) => {
  const paquetes = await obtenerCatalogoDePaquetes()
  res.json(paquetes)
})

packageRouter.get('/vuelos', requiereAgencia, async (req, res) => {
  const { origen, destino } = req.query
  if (typeof origen !== 'string' || typeof destino !== 'string') {
    res.status(400).json({ error: 'Origen y destino son requeridos' })
    return
  }
  try {
    const vuelos = await buscarVuelos(origen, destino)
    res.json(vuelos)
  } catch (error) {
    if (error instanceof ApiVuelosNoDisponible) {
      res.status(502).json({ error: error.message })
      return
    }
    throw error
  }
})

packageRouter.post('/', requiereAgencia, async (req, res) => {
  const agenciaId = req.usuario?.agenciaId
  if (!agenciaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const paquete = await registrarPaquete(req.body, agenciaId)
    res.status(201).json(paquete)
  } catch (error) {
    if (error instanceof DatosDePaqueteInvalidos) {
      res.status(400).json({ error: error.message })
      return
    }
    throw error
  }
})

packageRouter.post('/:id/comprar', requiereCliente, async (req, res) => {
  const cuentaId = req.usuario?.sub
  if (!cuentaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const venta = await comprarPaquete(String(req.params.id), cuentaId)
    res.status(201).json(venta)
  } catch (error) {
    if (error instanceof PaqueteInexistente || error instanceof ClienteInexistente) {
      res.status(404).json({ error: error.message })
      return
    }
    if (error instanceof VentaRechazada) {
      res.status(error.estado === 409 ? 409 : 400).json({ error: error.message })
      return
    }
    if (error instanceof ApiVuelosNoDisponible) {
      res.status(502).json({ error: error.message })
      return
    }
    throw error
  }
})

export { packageRouter }
