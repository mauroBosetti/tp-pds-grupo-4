import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { ejecutarConContexto, obtenerRequestId } from './contexto.js'
import { logger } from './logger.js'

export const ENCABEZADO_REQUEST_ID = 'x-request-id'
const FORMATO_REQUEST_ID = /^[\w.-]{1,100}$/

export function contextoDePeticion(req: Request, res: Response, next: NextFunction) {
  const entrante = req.headers[ENCABEZADO_REQUEST_ID]
  const requestId =
    typeof entrante === 'string' && FORMATO_REQUEST_ID.test(entrante) ? entrante : randomUUID()
  res.setHeader(ENCABEZADO_REQUEST_ID, requestId)
  ejecutarConContexto({ requestId }, next)
}

function nivelSegunEstado(estado: number) {
  if (estado >= 500) return 'error'
  if (estado >= 400) return 'warn'
  return 'info'
}

function rutaDe(req: Request): string {
  return req.route ? `${req.baseUrl}${req.route.path}` : 'sin_ruta'
}

export function registrarPeticiones(req: Request, res: Response, next: NextFunction) {
  const inicio = process.hrtime.bigint()
  const requestId = obtenerRequestId()
  res.on('finish', () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6
    const registrar = () =>
      logger[nivelSegunEstado(res.statusCode)](
        {
          metodo: req.method,
          ruta: rutaDe(req),
          status: res.statusCode,
          duracionMs: Math.round(duracionMs * 10) / 10,
        },
        'peticion_finalizada',
      )
    if (requestId) {
      ejecutarConContexto({ requestId }, registrar)
    } else {
      registrar()
    }
  })
  next()
}

function estadoDelError(error: unknown): number {
  const estado = (error as { status?: unknown } | null)?.status
  return typeof estado === 'number' && estado >= 400 && estado < 500 ? estado : 500
}

export function manejarErrores(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(error)
    return
  }
  const estado = estadoDelError(error)
  if (estado >= 500) {
    logger.error({ err: error }, 'error_no_controlado')
    res.status(500).json({ error: 'Error interno del servidor' })
    return
  }
  logger.warn({ err: error }, 'peticion_invalida')
  res.status(estado).json({ error: 'Petición inválida' })
}