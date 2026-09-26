import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { authRouter } from './authRutas.js'
import {
  iniciarSesionAgencia,
  iniciarSesionCliente,
  NoEsUsuarioAgencia,
  NoEsUsuarioCliente,
} from './autenticacionUsuarioServicio.js'
import { CredencialesInvalidas } from './autenticacionServicio.js'
import {
  registrarUsuarioAgencia,
  CodigoDeGrupoInvalido,
  EmailYaRegistrado as EmailAgenciaYaRegistrado,
} from '../usuariosAgencia/registroUsuarioAgenciaServicio.js'
import {
  registrarUsuarioCliente,
  DatosDeRegistroInvalidos as DatosRegistroClienteInvalidos,
  EmailYaRegistrado as EmailClienteYaRegistrado,
} from '../usuariosCliente/registroUsuarioClienteServicio.js'

vi.mock('./autenticacionUsuarioServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./autenticacionUsuarioServicio.js')>()
  return {
    ...real,
    iniciarSesionAgencia: vi.fn(),
    iniciarSesionCliente: vi.fn(),
  }
})

vi.mock('../usuariosAgencia/registroUsuarioAgenciaServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('../usuariosAgencia/registroUsuarioAgenciaServicio.js')>()
  return { ...real, registrarUsuarioAgencia: vi.fn() }
})

vi.mock('../usuariosCliente/registroUsuarioClienteServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('../usuariosCliente/registroUsuarioClienteServicio.js')>()
  return { ...real, registrarUsuarioCliente: vi.fn() }
})

const loginAgencia = vi.mocked(iniciarSesionAgencia)
const loginCliente = vi.mocked(iniciarSesionCliente)
const registrarAgencia = vi.mocked(registrarUsuarioAgencia)
const registrarCliente = vi.mocked(registrarUsuarioCliente)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRouter)
  return app
}

describe('POST /api/auth/agencia/login', () => {
  it('devuelve el resultado del login para agencia', async () => {
    loginAgencia.mockImplementation(async () => ({
      token: 't',
      usuario: { nombre: 'Bruno', email: 'bruno@agencia.com', rol: 'agencia' },
    }))

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/login')
      .send({ email: 'bruno@agencia.com', clave: 'secreta' })

    expect(respuesta.status).toBe(200)
    expect(respuesta.body.usuario).toMatchObject({ rol: 'agencia' })
  })

  it('responde 401 con credenciales inválidas', async () => {
    loginAgencia.mockImplementation(async () => { throw new CredencialesInvalidas() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/login')
      .send({ email: 'bruno@agencia.com', clave: 'mala' })

    expect(respuesta.status).toBe(401)
  })

  it('responde 401 cuando la cuenta no es de agencia', async () => {
    loginAgencia.mockImplementation(async () => { throw new NoEsUsuarioAgencia() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/login')
      .send({ email: 'cliente@correo.com', clave: 'secreta' })

    expect(respuesta.status).toBe(401)
    expect(respuesta.body).toEqual({ error: 'Email o contraseña incorrectos' })
  })
})

describe('POST /api/auth/agencia/registro', () => {
  it('responde 201 cuando el registro es exitoso', async () => {
    registrarAgencia.mockImplementation(async () => ({
      id: 'u-1',
      nombre: 'Bruno',
      cuentaId: 'c-1',
      agenciaId: 'ag-1',
    }))

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/registro')
      .send({ nombre: 'Bruno', email: 'bruno@agencia.com', clave: 'secreta', codigoDeGrupo: '12345678' })

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ nombre: 'Bruno', agenciaId: 'ag-1' })
  })

  it('responde 400 con un código inválido', async () => {
    registrarAgencia.mockImplementation(async () => { throw new CodigoDeGrupoInvalido() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/registro')
      .send({ nombre: 'Bruno', email: 'bruno@agencia.com', clave: 'secreta', codigoDeGrupo: '00000000' })

    expect(respuesta.status).toBe(400)
  })

  it('responde 409 cuando el email ya existe', async () => {
    registrarAgencia.mockImplementation(async () => { throw new EmailAgenciaYaRegistrado() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/registro')
      .send({ nombre: 'Bruno', email: 'bruno@agencia.com', clave: 'secreta', codigoDeGrupo: '12345678' })

    expect(respuesta.status).toBe(409)
  })
})

describe('POST /api/auth/cliente/login', () => {
  it('devuelve el resultado del login para cliente', async () => {
    loginCliente.mockImplementation(async () => ({
      token: 't',
      usuario: { nombre: 'Carlos', email: 'carlos@cliente.com', rol: 'cliente' },
    }))

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/login')
      .send({ email: 'carlos@cliente.com', clave: 'secreta' })

    expect(respuesta.status).toBe(200)
    expect(respuesta.body.usuario).toMatchObject({ rol: 'cliente' })
  })

  it('responde 401 con credenciales inválidas', async () => {
    loginCliente.mockImplementation(async () => { throw new CredencialesInvalidas() })

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/login')
      .send({ email: 'carlos@cliente.com', clave: 'mala' })

    expect(respuesta.status).toBe(401)
  })

  it('responde 401 cuando la cuenta no es de cliente', async () => {
    loginCliente.mockImplementation(async () => { throw new NoEsUsuarioCliente() })

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/login')
      .send({ email: 'agencia@correo.com', clave: 'secreta' })

    expect(respuesta.status).toBe(401)
    expect(respuesta.body).toEqual({ error: 'Email o contraseña incorrectos' })
  })
})

describe('POST /api/auth/cliente/registro', () => {
  it('responde 201 cuando el registro es exitoso', async () => {
    registrarCliente.mockImplementation(async () => ({
      id: 'cli-1',
      nombre: 'Carlos',
      cuentaId: 'c-1',
    }))

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/registro')
      .send({ nombre: 'Carlos', email: 'carlos@cliente.com', clave: 'secreta' })

    expect(respuesta.status).toBe(201)
    expect(respuesta.body).toMatchObject({ id: 'cli-1', nombre: 'Carlos' })
  })

  it('responde 400 cuando faltan datos obligatorios', async () => {
    registrarCliente.mockImplementation(async () => { throw new DatosRegistroClienteInvalidos() })

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/registro')
      .send({ nombre: '', email: 'carlos@cliente.com', clave: 'secreta' })

    expect(respuesta.status).toBe(400)
  })

  it('responde 409 cuando el email ya existe', async () => {
    registrarCliente.mockImplementation(async () => { throw new EmailClienteYaRegistrado() })

    const respuesta = await request(crearApp())
      .post('/api/auth/cliente/registro')
      .send({ nombre: 'Carlos', email: 'carlos@cliente.com', clave: 'secreta' })

    expect(respuesta.status).toBe(409)
  })
})
