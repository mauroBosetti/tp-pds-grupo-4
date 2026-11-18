import { Router } from 'express'
import { requiereAdministrador } from '../auth/requiereAdministrador.js'
import { obtenerUsuariosRegistrados } from './usuariosServicio.js'

const userRouter: Router = Router()

userRouter.get('/', requiereAdministrador, async (_req, res) => {
  const usuarios = await obtenerUsuariosRegistrados()
  res.json(usuarios)
})

export { userRouter }
