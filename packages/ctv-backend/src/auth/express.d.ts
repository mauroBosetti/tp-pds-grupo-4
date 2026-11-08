import type { DatosToken } from './token.js'

declare global {
  namespace Express {
    interface Request {
      usuario?: DatosToken
    }
  }
}

export {}
