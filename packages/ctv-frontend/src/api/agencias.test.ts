import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearAgencia, SinAutorizacion } from './agencias'
import { guardarTokenAdministrador } from '@/auth/tokenAdministrador'

function responderCon(cuerpo: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 201
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => cuerpo,
  })
}

describe('crearAgencia', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('incluye el token de administrador en el encabezado Authorization', async () => {
    guardarTokenAdministrador('abc.123')
    const fetchFalso = responderCon({ id: 'a-1', nombre: 'Turismo', codigoDeGrupo: null })
    vi.stubGlobal('fetch', fetchFalso)

    await crearAgencia('Turismo')

    const [, opciones] = fetchFalso.mock.calls[0]
    expect(opciones.headers.Authorization).toBe('Bearer abc.123')
  })

  it('no manda Authorization cuando no hay token', async () => {
    const fetchFalso = responderCon({ id: 'a-1', nombre: 'Turismo', codigoDeGrupo: null })
    vi.stubGlobal('fetch', fetchFalso)

    await crearAgencia('Turismo')

    const [, opciones] = fetchFalso.mock.calls[0]
    expect(opciones.headers.Authorization).toBeUndefined()
  })

  it('lanza SinAutorizacion ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'no' }, { status: 401 }))

    await expect(crearAgencia('Turismo')).rejects.toBeInstanceOf(SinAutorizacion)
  })
})
