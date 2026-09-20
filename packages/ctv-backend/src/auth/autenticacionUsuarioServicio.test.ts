import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import { verificarToken } from './token.js'
import { CredencialesInvalidas } from './autenticacionServicio.js'
import { CuentaSinRol, iniciarSesionUsuario } from './autenticacionUsuarioServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    cuenta: { findUnique: vi.fn() },
    usuarioAgencia: { findUnique: vi.fn() },
  },
}))

const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)
const buscarUsuarioAgencia = vi.mocked(cliente.usuarioAgencia.findUnique)

async function cuentaAgencia() {
  return { id: 'cuenta-1', email: 'bruno@agencia.com', hashClave: await bcrypt.hash('secreta', 10) }
}

describe('iniciarSesionUsuario', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
    buscarUsuarioAgencia.mockReset()
  })

  it('devuelve un token de agencia con la agenciaId', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAgencia())
    buscarUsuarioAgencia.mockResolvedValue({
      id: 'u-1',
      nombre: 'Bruno',
      cuentaId: 'cuenta-1',
      agenciaId: 'ag-1',
    })

    const { token, usuario } = await iniciarSesionUsuario('bruno@agencia.com', 'secreta')

    expect(usuario).toEqual({ nombre: 'Bruno', email: 'bruno@agencia.com', rol: 'agencia' })
    expect(verificarToken(token)).toMatchObject({
      sub: 'cuenta-1',
      rol: 'agencia',
      nombre: 'Bruno',
      agenciaId: 'ag-1',
    })
  })

  it('falla con credenciales inválidas', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAgencia())

    await expect(iniciarSesionUsuario('bruno@agencia.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando la cuenta no tiene rol de usuario', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAgencia())
    buscarUsuarioAgencia.mockResolvedValue(null)

    await expect(iniciarSesionUsuario('bruno@agencia.com', 'secreta')).rejects.toBeInstanceOf(
      CuentaSinRol,
    )
  })
})
