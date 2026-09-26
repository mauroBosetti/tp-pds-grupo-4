import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DatosInvalidos,
  EmailYaRegistrado,
  registrarUsuarioCliente,
} from './usuariosCliente'

function responderCon(cuerpo: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200
  return vi.fn().mockResolvedValue({
    ok: init.ok ?? status < 400,
    status,
    json: async () => cuerpo,
  })
}

const datosValidos = {
  nombre: 'Carlos',
  email: 'carlos@cliente.com',
  clave: 'secreta123',
}

describe('registrarUsuarioCliente', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('completa el registro cuando la respuesta es exitosa', async () => {
    vi.stubGlobal('fetch', responderCon({ id: 'cli-1', nombre: 'Carlos' }, { status: 201 }))

    await expect(registrarUsuarioCliente(datosValidos)).resolves.toBeUndefined()
  })

  it('lanza DatosInvalidos ante un 400', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'faltan datos' }, { status: 400 }))

    await expect(registrarUsuarioCliente(datosValidos)).rejects.toBeInstanceOf(DatosInvalidos)
  })

  it('lanza EmailYaRegistrado ante un 409', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'ya existe' }, { status: 409 }))

    await expect(registrarUsuarioCliente(datosValidos)).rejects.toBeInstanceOf(EmailYaRegistrado)
  })
})
