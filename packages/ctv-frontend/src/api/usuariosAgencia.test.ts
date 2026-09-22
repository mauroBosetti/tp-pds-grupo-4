import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CodigoDeGrupoInvalido,
  EmailYaRegistrado,
  registrarUsuarioAgencia,
} from './usuariosAgencia'

function responderConEstado(status: number) {
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => ({}),
  })
}

const datos = {
  nombre: 'Bruno',
  email: 'bruno@agencia.com',
  clave: 'secreta',
  codigoDeGrupo: '12345678',
}

describe('registrarUsuarioAgencia', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envía los datos al endpoint de registro', async () => {
    const fetchFalso = responderConEstado(201)
    vi.stubGlobal('fetch', fetchFalso)

    await registrarUsuarioAgencia(datos)

    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toContain('/api/auth/agencia/registro')
    expect(JSON.parse(opciones.body)).toEqual(datos)
  })

  it('lanza CodigoDeGrupoInvalido ante un 400', async () => {
    vi.stubGlobal('fetch', responderConEstado(400))

    await expect(registrarUsuarioAgencia(datos)).rejects.toBeInstanceOf(CodigoDeGrupoInvalido)
  })

  it('lanza EmailYaRegistrado ante un 409', async () => {
    vi.stubGlobal('fetch', responderConEstado(409))

    await expect(registrarUsuarioAgencia(datos)).rejects.toBeInstanceOf(EmailYaRegistrado)
  })
})
