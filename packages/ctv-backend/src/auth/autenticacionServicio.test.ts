import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import { CredencialesInvalidas, validarCredenciales } from './autenticacionServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    cuenta: { findUnique: vi.fn() },
  },
}))

const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)

async function cuentaConClave(email: string, clave: string) {
  return { id: 'cuenta-1', email, hashClave: await bcrypt.hash(clave, 10) }
}

describe('validarCredenciales', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
  })

  it('devuelve la cuenta cuando el email existe y la clave coincide', async () => {
    buscarCuenta.mockResolvedValue(await cuentaConClave('ada@ctv.com', 'secreta'))

    const cuenta = await validarCredenciales('ada@ctv.com', 'secreta')

    expect(cuenta.email).toBe('ada@ctv.com')
  })

  it('normaliza el email antes de buscarlo', async () => {
    buscarCuenta.mockResolvedValue(await cuentaConClave('ada@ctv.com', 'secreta'))

    await validarCredenciales('  ada@ctv.com  ', 'secreta')

    expect(buscarCuenta).toHaveBeenCalledWith({ where: { email: 'ada@ctv.com' } })
  })

  it('falla cuando la cuenta no existe', async () => {
    buscarCuenta.mockResolvedValue(null)

    await expect(validarCredenciales('nadie@ctv.com', 'x')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando la clave no coincide', async () => {
    buscarCuenta.mockResolvedValue(await cuentaConClave('ada@ctv.com', 'secreta'))

    await expect(validarCredenciales('ada@ctv.com', 'incorrecta')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })

  it('falla cuando faltan datos, sin consultar la base', async () => {
    await expect(validarCredenciales('', '')).rejects.toBeInstanceOf(CredencialesInvalidas)
    expect(buscarCuenta).not.toHaveBeenCalled()
  })
})
