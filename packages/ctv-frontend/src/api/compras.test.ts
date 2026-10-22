import { afterEach, describe, expect, it, vi } from 'vitest'
import { listarMisCompras } from './compras'
import { SinAutorizacion } from './paquetes'
import { guardarTokenUsuario } from '@/auth/tokenUsuario'

function responderCon(cuerpo: unknown, status = 200) {
  return vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => cuerpo })
}

describe('api de compras', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('listarMisCompras incluye el token del usuario', async () => {
    guardarTokenUsuario('abc.123')
    const fetchFalso = responderCon([{ id: 'c-1' }])
    vi.stubGlobal('fetch', fetchFalso)

    const compras = await listarMisCompras()

    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toContain('/api/compras')
    expect(opciones.headers.Authorization).toBe('Bearer abc.123')
    expect(compras).toHaveLength(1)
  })

  it('lanza SinAutorizacion cuando la sesión expiró', async () => {
    vi.stubGlobal('fetch', responderCon({}, 401))

    await expect(listarMisCompras()).rejects.toBeInstanceOf(SinAutorizacion)
  })

  it('falla cuando el backend responde error', async () => {
    vi.stubGlobal('fetch', responderCon({}, 500))

    await expect(listarMisCompras()).rejects.toThrow('No se pudieron obtener las compras')
  })
})
