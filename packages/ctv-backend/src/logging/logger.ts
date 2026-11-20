import pino from 'pino'
import { obtenerRequestId } from './contexto.js'

const nivelPorDefecto = process.env.NODE_ENV === 'test' ? 'silent' : 'info'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? nivelPorDefecto,
  base: { servicio: 'ctv-backend' },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
  mixin() {
    const requestId = obtenerRequestId()
    return requestId ? { requestId } : {}
  },
  redact: {
    paths: ['*.clave', '*.password', '*.hashClave', '*.token', '*.authorization'],
    censor: '[REDACTED]',
  },
})