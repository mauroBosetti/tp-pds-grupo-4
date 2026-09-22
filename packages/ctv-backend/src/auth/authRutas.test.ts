import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { authRouter } from './authRutas.js'
import { iniciarSesionUsuario, CuentaSinRol } from './autenticacionUsuarioServicio.js'
import { CredencialesInvalidas } from './autenticacionServicio.js'
import {
  registrarUsuarioAgencia,
  CodigoDeGrupoInvalido,
  EmailYaRegistrado,
} from '../usuariosAgencia/registroUsuarioAgenciaServicio.js'

vi.mock('./autenticacionUsuarioServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('./autenticacionUsuarioServicio.js')>()
  return { ...real, iniciarSesionUsuario: vi.fn() }
})

vi.mock('../usuariosAgencia/registroUsuarioAgenciaServicio.js', async (importarReal) => {
  const real = await importarReal<typeof import('../usuariosAgencia/registroUsuarioAgenciaServicio.js')>()
  return { ...real, registrarUsuarioAgencia: vi.fn() }
})

const login = vi.mocked(iniciarSesionUsuario)
const registrar = vi.mocked(registrarUsuarioAgencia)

function crearApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRouter)
  return app
}

describe('POST /api/auth/usuario/login', () => {
  it('devuelve el resultado del login', async () => {
    login.mockImplementation(async () => ({
      token: 't',
      usuario: { nombre: 'Bruno', email: 'bruno@agencia.com', rol: 'agencia' },
    }))

    const respuesta = await request(crearApp())
      .post('/api/auth/usuario/login')
      .send({ email: 'bruno@agencia.com', clave: 'secreta' })

    expect(respuesta.status).toBe(200)
    expect(respuesta.body.usuario).toMatchObject({ rol: 'agencia' })
  })

  it('responde 401 con credenciales inválidas', async () => {
    login.mockImplementation(async () => { throw new CredencialesInvalidas() })

    const respuesta = await request(crearApp())
      .post('/api/auth/usuario/login')
      .send({ email: 'bruno@agencia.com', clave: 'mala' })

    expect(respuesta.status).toBe(401)
  })

  it('responde 401 cuando la cuenta no tiene rol', async () => {
    login.mockImplementation(async () => { throw new CuentaSinRol() })

    const respuesta = await request(crearApp())
      .post('/api/auth/usuario/login')
      .send({ email: 'admin@ctv.com', clave: 'secreta' })

    expect(respuesta.status).toBe(401)
  })
})

describe('POST /api/auth/agencia/registro', () => {
  it('responde 201 cuando el registro es exitoso', async () => {
    registrar.mockImplementation(async () => ({
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
    registrar.mockImplementation(async () => { throw new CodigoDeGrupoInvalido() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/registro')
      .send({ nombre: 'Bruno', email: 'bruno@agencia.com', clave: 'secreta', codigoDeGrupo: '00000000' })

    expect(respuesta.status).toBe(400)
  })

  it('responde 409 cuando el email ya existe', async () => {
    registrar.mockImplementation(async () => { throw new EmailYaRegistrado() })

    const respuesta = await request(crearApp())
      .post('/api/auth/agencia/registro')
      .send({ nombre: 'Bruno', email: 'bruno@agencia.com', clave: 'secreta', codigoDeGrupo: '12345678' })

    expect(respuesta.status).toBe(409)
  })
})
