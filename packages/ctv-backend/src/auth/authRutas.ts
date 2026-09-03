import { Router } from 'express'
import { CredencialesInvalidas } from '../auth/autenticacionServicio.js'
import {
  iniciarSesionAdministrador,
  NoEsAdministrador,
} from '../usuariosAdministradores/autenticacionAdministradorServicio.js'

const authRouter: Router = Router()

authRouter.post('/administrador/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionAdministrador(req.body?.email, req.body?.clave)
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsAdministrador) {
      res.status(401).json({ error: 'Email o contraseña incorrectos' })
      return
    }
    throw error
  }
})

export { authRouter }
