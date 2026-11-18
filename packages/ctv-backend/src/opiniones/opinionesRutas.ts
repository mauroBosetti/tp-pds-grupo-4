import { Router } from 'express'
import { requiereCliente } from '../auth/requiereCliente.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import {
  DatosDeOpinionInvalidos,
  PaqueteNoComprado,
  opinarSobrePaquete,
} from './opinionesServicio.js'
import { logger } from '../logging/logger.js'

const opinionesRouter: Router = Router()

opinionesRouter.put('/:paqueteId', requiereCliente, async (req, res) => {
  const cuentaId = req.usuario?.sub
  if (!cuentaId) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  const paqueteId = String(req.params.paqueteId)
  try {
    const opinion = await opinarSobrePaquete(cuentaId, paqueteId, req.body ?? {})
    logger.info({ paqueteId: opinion.paqueteId, puntaje: opinion.puntaje }, 'opinion_guardada')
    res.json({
      paqueteId: opinion.paqueteId,
      comentario: opinion.comentario,
      puntaje: opinion.puntaje,
    })
  } catch (error) {
    if (error instanceof DatosDeOpinionInvalidos) {
      logger.warn({ paqueteId, motivo: 'DatosDeOpinionInvalidos' }, 'opinion_rechazada')
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof PaqueteNoComprado) {
      logger.warn({ paqueteId, motivo: 'PaqueteNoComprado' }, 'opinion_rechazada')
      res.status(403).json({ error: error.message })
      return
    }
    if (error instanceof ClienteInexistente) {
      logger.warn({ paqueteId, motivo: 'ClienteInexistente' }, 'opinion_rechazada')
      res.status(404).json({ error: error.message })
      return
    }
    throw error
  }
})

export { opinionesRouter }
