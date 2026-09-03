import { afterEach, describe, expect, it, vi } from 'vitest'
import { CredencialesInvalidas, loginAdministrador } from './autenticacion'

function responderCon(cuerpo: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200
  return vi.fn().mockResolvedValue({
    ok: init.ok ?? status < 400,
    status,
    json: async () => cuerpo,
  })
}

describe('loginAdministrador', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('devuelve token y administrador cuando el login es exitoso', async () => {
    const respuesta = { token: 'abc.123', administrador: { nombre: 'Ada', email: 'ada@ctv.com' } }
    vi.stubGlobal('fetch', responderCon(respuesta))

    const resultado = await loginAdministrador('ada@ctv.com', 'secreta')

    expect(resultado).toEqual(respuesta)
  })

  it('envía las credenciales al endpoint de administrador', async () => {
    const fetchFalso = responderCon({ token: 't', administrador: {} })
    vi.stubGlobal('fetch', fetchFalso)

    await loginAdministrador('ada@ctv.com', 'secreta')

    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toContain('/api/auth/administrador/login')
    expect(JSON.parse(opciones.body)).toEqual({ email: 'ada@ctv.com', clave: 'secreta' })
  })

  it('lanza CredencialesInvalidas ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'mal' }, { status: 401 }))

    await expect(loginAdministrador('ada@ctv.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })
})
