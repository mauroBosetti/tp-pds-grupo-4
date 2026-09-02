import type { NextFunction, Request, Response } from 'express'
import { verificarToken } from './token.js'

const prefijoBearer = 'Bearer '

export function requiereAdministrador(req: Request, res: Response, next: NextFunction) {
  const encabezado = req.headers.authorization
  if (!encabezado?.startsWith(prefijoBearer)) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }
  try {
    const datos = verificarToken(encabezado.slice(prefijoBearer.length))
    if (datos.rol !== 'administrador') {
      res.status(401).json({ error: 'No autenticado' })
      return
    }
    next()
  } catch {
    res.status(401).json({ error: 'No autenticado' })
  }
}
