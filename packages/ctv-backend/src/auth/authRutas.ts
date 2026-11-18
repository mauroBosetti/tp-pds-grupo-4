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
import { logger } from '../logging/logger.js'

const authRouter: Router = Router()

authRouter.post('/administrador/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionAdministrador(req.body?.email, req.body?.clave)
    logger.info({ rol: 'administrador' }, 'login_exitoso')
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsAdministrador) {
      logger.warn({ rol: 'administrador', motivo: error.constructor.name }, 'login_fallido')
      res.status(401).json({ error: 'Email o contraseña incorrectos' })
      return
    }
    throw error
  }
})

authRouter.post('/agencia/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionAgencia(req.body?.email, req.body?.clave)
    logger.info({ rol: 'agencia' }, 'login_exitoso')
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsUsuarioAgencia) {
      logger.warn({ rol: 'agencia', motivo: error.constructor.name }, 'login_fallido')
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
    logger.info({ rol: 'agencia', usuarioId: usuario.id, agenciaId: usuario.agenciaId }, 'usuario_registrado')
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, agenciaId: usuario.agenciaId })
  } catch (error) {
    if (error instanceof DatosRegistroAgenciaInvalidos || error instanceof CodigoDeGrupoInvalido) {
      logger.warn({ rol: 'agencia', motivo: error.constructor.name }, 'registro_rechazado')
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof EmailAgenciaYaRegistrado) {
      logger.warn({ rol: 'agencia', motivo: 'EmailYaRegistrado' }, 'registro_rechazado')
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }
})

authRouter.post('/cliente/login', async (req, res) => {
  try {
    const resultado = await iniciarSesionCliente(req.body?.email, req.body?.clave)
    logger.info({ rol: 'cliente' }, 'login_exitoso')
    res.json(resultado)
  } catch (error) {
    if (error instanceof CredencialesInvalidas || error instanceof NoEsUsuarioCliente) {
      logger.warn({ rol: 'cliente', motivo: error.constructor.name }, 'login_fallido')
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
    logger.info({ rol: 'cliente', usuarioId: usuario.id }, 'usuario_registrado')
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre })
  } catch (error) {
    if (error instanceof DatosRegistroClienteInvalidos) {
      logger.warn({ rol: 'cliente', motivo: error.constructor.name }, 'registro_rechazado')
      res.status(400).json({ error: error.message })
      return
    }
    if (error instanceof EmailClienteYaRegistrado) {
      logger.warn({ rol: 'cliente', motivo: 'EmailYaRegistrado' }, 'registro_rechazado')
      res.status(409).json({ error: error.message })
      return
    }
    throw error
  }
})

export { authRouter }
