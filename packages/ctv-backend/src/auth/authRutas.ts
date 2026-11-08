import { Router } from 'express'
import { CredencialesInvalidas } from '../auth/autenticacionServicio.js'
import {
  iniciarSesionAdministrador,
  NoEsAdministrador,
} from '../usuariosAdministradores/autenticacionAdministradorServicio.js'
import {
  iniciarSesionAgencia,
  iniciarSesionCliente,
  NoEsUsuarioAgencia,
  NoEsUsuarioCliente,
} from './autenticacionUsuarioServicio.js'
import {
  CodigoDeGrupoInvalido,
  DatosDeRegistroInvalidos as DatosRegistroAgenciaInvalidos,
  EmailYaRegistrado as EmailAgenciaYaRegistrado,
  registrarUsuarioAgencia,
} from '../usuariosAgencia/registroUsuarioAgenciaServicio.js'
import {
  DatosDeRegistroInvalidos as DatosRegistroClienteInvalidos,
  EmailYaRegistrado as EmailClienteYaRegistrado,
  registrarUsuarioCliente,
} from '../usuariosCliente/registroUsuarioClienteServicio.js'

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

authRouter.post('/agencia/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionAgencia(req.body?.email, req.body?.clave)
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsUsuarioAgencia) {
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
    if (error instanceof DatosRegistroAgenciaInvalidos || error instanceof CodigoDeGrupoInvalido) {
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof EmailAgenciaYaRegistrado) {
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }
})

authRouter.post('/cliente/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionCliente(req.body?.email, req.body?.clave)
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsUsuarioCliente) {
      res.status(401).json({ error: 'Email o contraseña incorrectos' })
      return
    }
    throw error
  }
})

authRouter.post('/cliente/registro', async (req, res) => {
  try {
    const usuario = await registrarUsuarioCliente({
      nombre: req.body?.nombre,
      email: req.body?.email,
      clave: req.body?.clave,
    })
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre })
  } catch (error) {
    if (error instanceof DatosRegistroClienteInvalidos) {
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof EmailClienteYaRegistrado) {
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }
})

export { authRouter }
