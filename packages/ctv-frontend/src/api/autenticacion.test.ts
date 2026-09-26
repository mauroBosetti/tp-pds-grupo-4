import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CredencialesInvalidas,
  loginAdministrador,
  loginAgencia,
  loginCliente,
} from './autenticacion'

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

describe('loginAgencia', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('devuelve token y usuario cuando el login es exitoso', async () => {
    const respuesta = {
      token: 'token-agencia',
      usuario: { nombre: 'Bruno', email: 'bruno@agencia.com', rol: 'agencia' as const },
    }
    vi.stubGlobal('fetch', responderCon(respuesta))

    const resultado = await loginAgencia('bruno@agencia.com', 'secreta')

    expect(resultado).toEqual(respuesta)
  })

  it('lanza CredencialesInvalidas ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'mal' }, { status: 401 }))

    await expect(loginAgencia('bruno@agencia.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })
})

describe('loginCliente', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('devuelve token y usuario cuando el login es exitoso', async () => {
    const respuesta = {
      token: 'token-cliente',
      usuario: { nombre: 'Carlos', email: 'carlos@cliente.com', rol: 'cliente' as const },
    }
    vi.stubGlobal('fetch', responderCon(respuesta))

    const resultado = await loginCliente('carlos@cliente.com', 'secreta')

    expect(resultado).toEqual(respuesta)
  })

  it('lanza CredencialesInvalidas ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'mal' }, { status: 401 }))

    await expect(loginCliente('carlos@cliente.com', 'mala')).rejects.toBeInstanceOf(
      CredencialesInvalidas,
    )
  })
})
