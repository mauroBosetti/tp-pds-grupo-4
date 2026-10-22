import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { buscarOpinionesDeCliente } from '../opiniones/opinionesRepositorio.js'
import { buscarComprasDeCliente } from './comprasRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { obtenerComprasDelCliente } from './comprasServicio.js'

vi.mock('../usuariosCliente/usuariosClienteRepositorio.js', () => ({
  buscarUsuarioClientePorCuentaId: vi.fn(),
}))
vi.mock('./comprasRepositorio.js', () => ({ buscarComprasDeCliente: vi.fn() }))
vi.mock('../opiniones/opinionesRepositorio.js', () => ({ buscarOpinionesDeCliente: vi.fn() }))

const buscarCliente = vi.mocked(buscarUsuarioClientePorCuentaId)
const buscarCompras = vi.mocked(buscarComprasDeCliente)
const buscarOpiniones = vi.mocked(buscarOpinionesDeCliente)

describe('obtenerComprasDelCliente', () => {
  beforeEach(() => {
    buscarCliente.mockReset()
    buscarCompras.mockReset()
    buscarOpiniones.mockReset()
  })

  it('devuelve las compras del cliente de la cuenta', async () => {
    buscarCliente.mockResolvedValue({ id: 'u-1', nombre: 'Clara', cuentaId: 'cuenta-3' })
    buscarCompras.mockResolvedValue([])
    buscarOpiniones.mockResolvedValue([])

    await obtenerComprasDelCliente('cuenta-3')

    expect(buscarCompras).toHaveBeenCalledWith('u-1')
  })

  it('adjunta a cada compra la opinión del cliente sobre ese paquete', async () => {
    buscarCliente.mockResolvedValue({ id: 'u-1', nombre: 'Clara', cuentaId: 'cuenta-3' })
    buscarCompras.mockResolvedValue([
      { id: 'c-1', paqueteId: 'p-1' },
      { id: 'c-2', paqueteId: 'p-2' },
    ] as Awaited<ReturnType<typeof buscarComprasDeCliente>>)
    buscarOpiniones.mockResolvedValue([
      { usuarioClienteId: 'u-1', paqueteId: 'p-2', favorito: false, comentario: 'Genial', puntaje: 5 },
    ])

    const compras = await obtenerComprasDelCliente('cuenta-3')

    expect(compras[0].opinion).toBeNull()
    expect(compras[1].opinion).toEqual({ comentario: 'Genial', puntaje: 5 })
  })

  it('falla cuando la cuenta no tiene un cliente', async () => {
    buscarCliente.mockResolvedValue(null)

    await expect(obtenerComprasDelCliente('cuenta-3')).rejects.toBeInstanceOf(ClienteInexistente)
    expect(buscarCompras).not.toHaveBeenCalled()
  })
})
