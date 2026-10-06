import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import { verificarToken } from './token.js'
import { CredencialesInvalidas } from './autenticacionServicio.js'
import {
  iniciarSesionAgencia,
  iniciarSesionCliente,
  NoEsUsuarioAgencia,
  NoEsUsuarioCliente,
} from './autenticacionUsuarioServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    cuenta: { findUnique: vi.fn() },
    usuarioAgencia: { findUnique: vi.fn() },
    usuarioCliente: { findUnique: vi.fn() },
  },
}))

const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)
const buscarUsuarioAgencia = vi.mocked(cliente.usuarioAgencia.findUnique)
const buscarUsuarioCliente = vi.mocked(cliente.usuarioCliente.findUnique)

async function cuentaPrueba(email: string) {
  return { id: 'cuenta-1', email, hashClave: await bcrypt.hash('secreta', 10) }
}

describe('iniciarSesionAgencia', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
    buscarUsuarioAgencia.mockReset()
    buscarUsuarioCliente.mockReset()
  })

  it('devuelve un token de agencia con la agenciaId', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('bruno@agencia.com'))
    buscarUsuarioAgencia.mockResolvedValue({
      id: 'u-1',
      nombre: 'Bruno',
      cuentaId: 'cuenta-1',
      agenciaId: 'ag-1',
    })

    const { token, usuario } = await iniciarSesionAgencia('bruno@agencia.com', 'secreta')

    expect(usuario).toEqual({ nombre: 'Bruno', email: 'bruno@agencia.com', rol: 'agencia' })
    expect(verificarToken(token)).toMatchObject({
      sub: 'cuenta-1',
      rol: 'agencia',
      nombre: 'Bruno',
      agenciaId: 'ag-1',
    })
  })

  it('falla con credenciales inválidas', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('bruno@agencia.com'))

    await expect(iniciarSesionAgencia('bruno@agencia.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando la cuenta no es de un usuario de agencia', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('bruno@agencia.com'))
    buscarUsuarioAgencia.mockResolvedValue(null)

    await expect(iniciarSesionAgencia('bruno@agencia.com', 'secreta')).rejects.toBeInstanceOf(
      NoEsUsuarioAgencia,
    )
  })
})

describe('iniciarSesionCliente', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
    buscarUsuarioAgencia.mockReset()
    buscarUsuarioCliente.mockReset()
  })

  it('devuelve un token de cliente', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('carlos@cliente.com'))
    buscarUsuarioCliente.mockResolvedValue({
      id: 'cli-1',
      nombre: 'Carlos',
      cuentaId: 'cuenta-1',
    })

    const { token, usuario } = await iniciarSesionCliente('carlos@cliente.com', 'secreta')

    expect(usuario).toEqual({ nombre: 'Carlos', email: 'carlos@cliente.com', rol: 'cliente' })
    expect(verificarToken(token)).toMatchObject({
      sub: 'cuenta-1',
      rol: 'cliente',
      nombre: 'Carlos',
    })
  })

  it('falla con credenciales inválidas', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('carlos@cliente.com'))

    await expect(iniciarSesionCliente('carlos@cliente.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando la cuenta no es de un cliente', async () => {
    buscarCuenta.mockResolvedValue(await cuentaPrueba('carlos@cliente.com'))
    buscarUsuarioCliente.mockResolvedValue(null)

    await expect(iniciarSesionCliente('carlos@cliente.com', 'secreta')).rejects.toBeInstanceOf(
      NoEsUsuarioCliente,
    )
  })
})
