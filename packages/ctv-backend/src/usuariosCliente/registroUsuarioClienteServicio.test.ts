import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import {
  DatosDeRegistroInvalidos,
  EmailYaRegistrado,
  registrarUsuarioCliente,
} from './registroUsuarioClienteServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    cuenta: { findUnique: vi.fn() },
    usuarioCliente: { create: vi.fn() },
  },
}))

const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)
const crearUsuarioCliente = vi.mocked(cliente.usuarioCliente.create)

const datosValidos = {
  nombre: 'Carlos',
  email: 'carlos@cliente.com',
  clave: 'secreta123',
}

describe('registrarUsuarioCliente', () => {
  beforeEach(() => {
    buscarCuenta.mockReset()
    crearUsuarioCliente.mockReset()
  })

  it('falla cuando faltan datos obligatorios', async () => {
    await expect(
      registrarUsuarioCliente({ ...datosValidos, nombre: '   ' }),
    ).rejects.toBeInstanceOf(DatosDeRegistroInvalidos)

    await expect(
      registrarUsuarioCliente({ ...datosValidos, email: '' }),
    ).rejects.toBeInstanceOf(DatosDeRegistroInvalidos)

    await expect(
      registrarUsuarioCliente({ ...datosValidos, clave: '' }),
    ).rejects.toBeInstanceOf(DatosDeRegistroInvalidos)

    expect(crearUsuarioCliente).not.toHaveBeenCalled()
  })

  it('falla cuando el email ya está registrado', async () => {
    buscarCuenta.mockResolvedValue({ id: 'c-1', email: datosValidos.email, hashClave: 'x' })

    await expect(registrarUsuarioCliente(datosValidos)).rejects.toBeInstanceOf(EmailYaRegistrado)
    expect(crearUsuarioCliente).not.toHaveBeenCalled()
  })

  it('crea el usuario cliente con su cuenta y clave hasheada', async () => {
    buscarCuenta.mockResolvedValue(null)
    crearUsuarioCliente.mockResolvedValue({ id: 'cli-1', nombre: 'Carlos', cuentaId: 'c-1' })

    await registrarUsuarioCliente(datosValidos)

    expect(crearUsuarioCliente).toHaveBeenCalledOnce()
    const argumentos = crearUsuarioCliente.mock.calls[0][0]
    expect(argumentos.data.nombre).toBe('Carlos')
    expect(argumentos.data.cuenta.create.email).toBe('carlos@cliente.com')
    const hashOk = await bcrypt.compare('secreta123', argumentos.data.cuenta.create.hashClave)
    expect(hashOk).toBe(true)
  })
})
