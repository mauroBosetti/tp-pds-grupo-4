import { Router } from 'express'
import { CredencialesInvalidas } from '../auth/autenticacionServicio.js'
import {
  iniciarSesionAdministrador,
  NoEsAdministrador,
} from '../usuariosAdministradores/autenticacionAdministradorServicio.js'
import { CuentaSinRol, iniciarSesionUsuario } from './autenticacionUsuarioServicio.js'
import {
  CodigoDeGrupoInvalido,
  DatosDeRegistroInvalidos,
  EmailYaRegistrado,
  registrarUsuarioAgencia,
} from '../usuariosAgencia/registroUsuarioAgenciaServicio.js'

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

authRouter.post('/usuario/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionUsuario(req.body?.email, req.body?.clave)
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof CuentaSinRol) {
      res.status(401).json({ error: 'Email o contraseña incorrectos' })
      return
    }
    throw error
  }
})

authRouter.post('/agencia/registro', async (req, res) => {
  try {
    const usuario = await registrarUsuarioAgencia({
      nombre: req.body?.nombre,
      email: req.body?.email,
      clave: req.body?.clave,
      codigoDeGrupo: req.body?.codigoDeGrupo,
    })
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, agenciaId: usuario.agenciaId })
  } catch (error) {
    if (error instanceof DatosDeRegistroInvalidos || error instanceof CodigoDeGrupoInvalido) {
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof EmailYaRegistrado) {
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }
})

export { authRouter }
