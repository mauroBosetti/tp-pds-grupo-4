import { Router } from 'express'
import { requiereCliente } from '../auth/requiereCliente.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import {
  DatosDeOpinionInvalidos,
  PaqueteNoComprado,
  opinarSobrePaquete,
} from './opinionesServicio.js'

const opinionesRouter: Router = Router()

opinionesRouter.put('/:paqueteId', requiereCliente, async (req, res) => {
  const cuentaId = req.usuario?.sub
  if (!cuentaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const opinion = await opinarSobrePaquete(cuentaId, String(req.params.paqueteId), req.body ?? {})
    res.json({
      paqueteId: opinion.paqueteId,
      comentario: opinion.comentario,
      puntaje: opinion.puntaje,
    })
  } catch (error) {
    if (error instanceof DatosDeOpinionInvalidos) {
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof PaqueteNoComprado) {
      res.status(403).json({ error: error.message })
      return
    }
    if (error instanceof ClienteInexistente) {
      res.status(404).json({ error: error.message })
      return
    }
    throw error
  }
})

export { opinionesRouter }
