import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiVuelosNoDisponible, VentaRechazada, venderVuelos } from './clienteVuelos.js'

const fetchSimulado = vi.fn()
vi.stubGlobal('fetch', fetchSimulado)

function respuestaJson(estado: number, cuerpo: unknown) {
  return new Response(JSON.stringify(cuerpo), { status: estado })
}

describe('venderVuelos', () => {
  afterEach(() => {
    fetchSimulado.mockReset()
  })

  it('envía los ids de vuelo y el pasajero a la API de vuelos', async () => {
    const venta = { id_venta: 3, pasajero: 'Clara', ids_vuelo: [1, 2] }
    fetchSimulado.mockResolvedValue(respuestaJson(200, venta))

    const resultado = await venderVuelos([1, 2], 'Clara')

    expect(resultado).toEqual(venta)
    const [url, opciones] = fetchSimulado.mock.calls[0]
    expect(url).toMatch(/\/api\/venta$/)
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toEqual({ ids_vuelo: [1, 2], pasajero: 'Clara' })
  })

  it('propaga el estado y el motivo cuando la venta es rechazada', async () => {
    fetchSimulado.mockResolvedValue(
      respuestaJson(409, { error: 'El vuelo 2 no tiene disponibilidad' }),
    )

    const rechazo = await venderVuelos([1, 2], 'Clara').catch((error) => error)

    expect(rechazo).toBeInstanceOf(VentaRechazada)
    expect(rechazo.estado).toBe(409)
    expect(rechazo.message).toBe('El vuelo 2 no tiene disponibilidad')
  })

  it('falla como no disponible cuando la API de vuelos responde error de servidor', async () => {
    fetchSimulado.mockResolvedValue(respuestaJson(500, { error: 'boom' }))

    await expect(venderVuelos([1, 2], 'Clara')).rejects.toBeInstanceOf(ApiVuelosNoDisponible)
  })

  it('falla como no disponible cuando no se puede conectar', async () => {
    fetchSimulado.mockRejectedValue(new TypeError('fetch failed'))

    await expect(venderVuelos([1, 2], 'Clara')).rejects.toBeInstanceOf(ApiVuelosNoDisponible)
  })
})
