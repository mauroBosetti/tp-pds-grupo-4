import { afterEach, describe, expect, it, vi } from 'vitest'
import { buscarVuelos, crearPaquete, SinAutorizacion } from './paquetes'
import { guardarTokenUsuario } from '@/auth/tokenUsuario'

function responderCon(cuerpo: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => cuerpo,
  })
}

const paquete = {
  nombre: 'Escapada a Madrid',
  precio: 1500,
  origen: 'Buenos Aires',
  destino: 'Madrid',
  vueloIdaId: 1,
  vueloVueltaId: 2,
}

describe('api de paquetes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('buscarVuelos incluye el token del usuario y arma la query con origen y destino', async () => {
    guardarTokenUsuario('abc.123')
    const fetchFalso = responderCon([])
    vi.stubGlobal('fetch', fetchFalso)

    await buscarVuelos('Buenos Aires', 'Madrid')

    const [url, opciones] = fetchFalso.mock.calls[0]
    expect(url).toContain('origen=Buenos+Aires')
    expect(url).toContain('destino=Madrid')
    expect(opciones.headers.Authorization).toBe('Bearer abc.123')
  })

  it('crearPaquete manda los datos con el token del usuario', async () => {
    guardarTokenUsuario('abc.123')
    const fetchFalso = responderCon({ id: 'p-1', ...paquete, agenciaId: 'ag-1' }, { status: 201 })
    vi.stubGlobal('fetch', fetchFalso)

    await crearPaquete(paquete)

    const [, opciones] = fetchFalso.mock.calls[0]
    expect(opciones.method).toBe('POST')
    expect(opciones.headers.Authorization).toBe('Bearer abc.123')
    expect(JSON.parse(opciones.body)).toEqual(paquete)
  })

  it('lanza SinAutorizacion ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon({ error: 'no' }, { status: 401 }))

    await expect(crearPaquete(paquete)).rejects.toBeInstanceOf(SinAutorizacion)
  })
})
