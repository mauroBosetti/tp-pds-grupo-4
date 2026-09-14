import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import {
  CodigoDeGrupoInvalido,
  DatosDeRegistroInvalidos,
  EmailYaRegistrado,
  registrarUsuarioAgencia,
} from './registroUsuarioAgenciaServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    agencia: { findUnique: vi.fn() },
    cuenta: { findUnique: vi.fn() },
    usuarioAgencia: { create: vi.fn() },
  },
}))

const buscarAgencia = vi.mocked(cliente.agencia.findUnique)
const buscarCuenta = vi.mocked(cliente.cuenta.findUnique)
const crear = vi.mocked(cliente.usuarioAgencia.create)

const datosValidos = {
  nombre: 'Bruno',
  email: 'bruno@agencia.com',
  clave: 'secreta',
  codigoDeGrupo: '12345678',
}

describe('registrarUsuarioAgencia', () => {
  beforeEach(() => {
    buscarAgencia.mockReset()
    buscarCuenta.mockReset()
    crear.mockReset()
  })

  it('falla cuando faltan datos', async () => {
    await expect(
      registrarUsuarioAgencia({ ...datosValidos, nombre: '  ' }),
    ).rejects.toBeInstanceOf(DatosDeRegistroInvalidos)
    expect(buscarAgencia).not.toHaveBeenCalled()
  })

  it('falla cuando el código no corresponde a ninguna agencia', async () => {
    buscarAgencia.mockResolvedValue(null)

    await expect(registrarUsuarioAgencia(datosValidos)).rejects.toBeInstanceOf(CodigoDeGrupoInvalido)
    expect(crear).not.toHaveBeenCalled()
  })

  it('falla cuando el email ya está registrado', async () => {
    buscarAgencia.mockResolvedValue({ id: 'ag-1', nombre: 'Sur', codigoDeGrupo: '12345678' })
    buscarCuenta.mockResolvedValue({ id: 'c-1', email: datosValidos.email, hashClave: 'x' })

    await expect(registrarUsuarioAgencia(datosValidos)).rejects.toBeInstanceOf(EmailYaRegistrado)
    expect(crear).not.toHaveBeenCalled()
  })

  it('crea el usuario asociándolo a la agencia del código', async () => {
    buscarAgencia.mockResolvedValue({ id: 'ag-1', nombre: 'Sur', codigoDeGrupo: '12345678' })
    buscarCuenta.mockResolvedValue(null)
    crear.mockResolvedValue({ id: 'u-1', nombre: 'Bruno', cuentaId: 'c-1', agenciaId: 'ag-1' })

    await registrarUsuarioAgencia(datosValidos)

    const argumentos = crear.mock.calls[0][0]
    expect(argumentos.data.nombre).toBe('Bruno')
    expect(argumentos.data.agencia).toEqual({ connect: { id: 'ag-1' } })
    expect(argumentos.data.cuenta.create.email).toBe('bruno@agencia.com')
    const hashOk = await bcrypt.compare('secreta', argumentos.data.cuenta.create.hashClave)
    expect(hashOk).toBe(true)
  })
})
