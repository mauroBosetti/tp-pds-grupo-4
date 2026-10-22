import { afterEach, describe, expect, it, vi } from 'vitest'
import { guardarOpinion } from './opiniones'
import { SinAutorizacion } from './paquetes'
import { guardarTokenUsuario } from '@/auth/tokenUsuario'

function responderCon(cuerpo: unknown, status = 200) {
  return vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => cuerpo })
}

describe('api de opiniones', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('guardarOpinion hace PUT al paquete con el token y los datos', async () => {
    guardarTokenUsuario('abc.123')
    const fetchFalso = responderCon({ comentario: 'Genial', puntaje: 5 })
    vi.stubGlobal('fetch', fetchFalso)

    const opinion = await guardarOpinion('p-1', { puntaje: 5, comentario: 'Genial' })

    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toContain('/api/review/p-1')
    expect(opciones.method).toBe('PUT')
    expect(opciones.headers.Authorization).toBe('Bearer abc.123')
    expect(JSON.parse(opciones.body)).toEqual({ puntaje: 5, comentario: 'Genial' })
    expect(opinion.puntaje).toBe(5)
  })

  it('falla con el motivo que informa el backend', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'Solo podés opinar sobre paquetes que compraste' }, 403))

    await expect(guardarOpinion('p-1', { puntaje: 5 })).rejects.toThrow('Solo podés opinar')
  })

  it('lanza SinAutorizacion cuando la sesión expiró', async () => {
    vi.stubGlobal('fetch', responderCon({}, 401))

    await expect(guardarOpinion('p-1', { puntaje: 5 })).rejects.toBeInstanceOf(SinAutorizacion)
  })
})
