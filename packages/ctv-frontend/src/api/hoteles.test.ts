import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearHotel, listarHoteles, SinAutorizacion } from './hoteles'
import { guardarTokenAdministrador } from '@/auth/tokenAdministrador'
import { guardarTokenUsuario } from '@/auth/tokenUsuario'

function responderCon(cuerpo: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 201
  return vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => cuerpo })
}

const datosHotel = {
  nombre: 'Hotel Prueba',
  direccion: 'Av. Siempreviva 742',
  pais: 'Argentina',
  ciudad: 'Buenos Aires',
  imagen: 'https://example.com/hotel.jpg',
}

const hotelCreado = { id: 'h-1', ...datosHotel }

describe('crearHotel', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('incluye el token de administrador en el encabezado Authorization', async () => {
    guardarTokenAdministrador('token-123')
    const fetchFalso = responderCon(hotelCreado)
    vi.stubGlobal('fetch', fetchFalso)

    await crearHotel(datosHotel)

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Authorization']).toBe('Bearer token-123')
  })

  it('no manda Authorization cuando no hay token', async () => {
    const fetchFalso = responderCon(hotelCreado)
    vi.stubGlobal('fetch', fetchFalso)

    await crearHotel(datosHotel)

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('lanza SinAutorizacion ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon(null, { status: 401 }))

    await expect(crearHotel(datosHotel)).rejects.toBeInstanceOf(SinAutorizacion)
  })
})

describe('listarHoteles', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('incluye el token de usuario en el encabezado Authorization', async () => {
    guardarTokenUsuario('token-usr')
    const fetchFalso = responderCon([hotelCreado])
    vi.stubGlobal('fetch', fetchFalso)

    const hoteles = await listarHoteles()

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Authorization']).toBe('Bearer token-usr')
    expect(hoteles).toEqual([hotelCreado])
  })

  it('no manda Authorization cuando no hay token', async () => {
    const fetchFalso = responderCon([hotelCreado])
    vi.stubGlobal('fetch', fetchFalso)

    await listarHoteles()

    const [, opciones] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect((opciones.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('lanza SinAutorizacion ante un 401', async () => {
    vi.stubGlobal('fetch', responderCon(null, { status: 401 }))

    await expect(listarHoteles()).rejects.toBeInstanceOf(SinAutorizacion)
  })
})
