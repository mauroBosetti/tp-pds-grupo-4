import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  obtenerUsuarios,
  obtenerAgencias,
  obtenerPaquetesDeInteres,
  obtenerPuntajesYObservaciones,
  obtenerTodasLasCompras,
  obtenerReportes,
  SinAutorizacion,
} from './admin'
import { guardarTokenAdministrador } from '@/auth/tokenAdministrador'

function responderCon(cuerpo: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    statusText: 'OK',
    json: async () => cuerpo,
  })
}

describe('api admin', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('obtenerReportes incluye el token de admin en Authorization', async () => {
    guardarTokenAdministrador('adm.tok')
    const fetchFalso = responderCon({
      topCompradores: [],
      topDestinosRankeados: [],
      topAgencias: [],
      topDestinosVendidos: [],
    })
    vi.stubGlobal('fetch', fetchFalso)

    const resultado = await obtenerReportes()

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Authorization']).toBe('Bearer adm.tok')
    expect(resultado.topCompradores).toEqual([])
  })

  it('obtenerUsuarios devuelve lista de usuarios', async () => {
    guardarTokenAdministrador('adm.tok')
    const usuarios = [{ id: '1', nombre: 'Ana', email: 'a@a.com', rol: 'cliente', agencia: null }]
    const fetchFalso = responderCon(usuarios)
    vi.stubGlobal('fetch', fetchFalso)

    const res = await obtenerUsuarios()
    expect(res).toEqual(usuarios)
  })

  it('lanza SinAutorizacion ante 401', async () => {
    vi.stubGlobal('fetch', responderCon(null, { status: 401 }))
    await expect(obtenerTodasLasCompras()).rejects.toBeInstanceOf(SinAutorizacion)
  })
})
