import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verificarToken } from '../auth/token.js'
import { cliente } from '../db/cliente.js'
import {
  iniciarSesionAdministrador,
  NoEsAdministrador,
} from './autenticacionAdministradorServicio.js'
import { CredencialesInvalidas } from '../auth/autenticacionServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    cuenta: { findUnique: vi.fn() },
    usuarioAdministrador: { findUnique: vi.fn() },
  },
}))

const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)
const buscarAdministrador = vi.mocked(cliente.usuarioAdministrador.findUnique)

async function cuentaAdmin() {
  return { id: 'cuenta-1', email: 'ada@ctv.com', hashClave: await bcrypt.hash('secreta', 10) }
}

describe('iniciarSesionAdministrador', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
    buscarAdministrador.mockReset()
  })

  it('devuelve un token de administrador válido con las credenciales correctas', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAdmin())
    buscarAdministrador.mockResolvedValue({ id: 'admin-1', nombre: 'Ada', cuentaId: 'cuenta-1' })

    const { token, administrador } = await iniciarSesionAdministrador('ada@ctv.com', 'secreta')

    expect(administrador).toEqual({ nombre: 'Ada', email: 'ada@ctv.com' })
    const datos = verificarToken(token)
    expect(datos).toMatchObject({ sub: 'cuenta-1', rol: 'administrador', nombre: 'Ada' })
  })

  it('falla con credenciales inválidas', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAdmin())

    await expect(iniciarSesionAdministrador('ada@ctv.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando la cuenta no es de un administrador', async () => {
    buscarCuenta.mockResolvedValue(await cuentaAdmin())
    buscarAdministrador.mockResolvedValue(null)

    await expect(iniciarSesionAdministrador('ada@ctv.com', 'secreta')).rejects.toBeInstanceOf(
      NoEsAdministrador,
    )
  })
})
