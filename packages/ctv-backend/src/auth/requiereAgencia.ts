import type { NextFunction, Request, Response } from 'express'
import { verificarToken } from './token.js'

const prefijoBearer = 'Bearer '

export function requiereAgencia(req: Request, res: Response, next: NextFunction) {
  const encabezado = req.headers.authorization
  if (!encabezado?.startsWith(prefijoBearer)) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const datos = verificarToken(encabezado.slice(prefijoBearer.length))
    if (datos.rol !== 'agencia') {
      res.status(401).json({ error: 'No autenticado' })
      return
    }
    req.usuario = datos
    next()
  } catch {
    res.status(401).json({ error: 'No autenticado' })
  }
}
