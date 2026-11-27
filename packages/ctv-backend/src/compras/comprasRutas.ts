import { Router } from 'express'
import { requiereCliente } from '../auth/requiereCliente.js'
import { requiereAdministrador } from '../auth/requiereAdministrador.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { obtenerComprasDelCliente, obtenerTodasLasCompras } from './comprasServicio.js'

const comprasRouter: Router = Router()

comprasRouter.get('/todas', requiereAdministrador, async (_req, res) => {
  const compras = await obtenerTodasLasCompras()
  res.json(compras)
})

comprasRouter.get('/', requiereCliente, async (req, res) => {
  const cuentaId = req.usuario?.sub
  if (!cuentaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    res.json(await obtenerComprasDelCliente(cuentaId))
  } catch (error) {
    if (error instanceof ClienteInexistente) {
      res.status(404).json({ error: error.message })
      return
    }
    throw error
  }
})

export { comprasRouter }
