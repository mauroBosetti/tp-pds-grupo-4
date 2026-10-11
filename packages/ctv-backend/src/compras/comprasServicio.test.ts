import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { buscarComprasDeCliente } from './comprasRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { obtenerComprasDelCliente } from './comprasServicio.js'

vi.mock('../usuariosCliente/usuariosClienteRepositorio.js', () => ({
  buscarUsuarioClientePorCuentaId: vi.fn(),
}))
vi.mock('./comprasRepositorio.js', () => ({ buscarComprasDeCliente: vi.fn() }))

const buscarCliente = vi.mocked(buscarUsuarioClientePorCuentaId)
const buscarCompras = vi.mocked(buscarComprasDeCliente)

describe('obtenerComprasDelCliente', () => {
  beforeEach(() => {
    buscarCliente.mockReset()
    buscarCompras.mockReset()
  })

  it('devuelve las compras del cliente de la cuenta', async () => {
    buscarCliente.mockResolvedValue({ id: 'u-1', nombre: 'Clara', cuentaId: 'cuenta-3' })
    buscarCompras.mockResolvedValue([])

    await obtenerComprasDelCliente('cuenta-3')

    expect(buscarCompras).toHaveBeenCalledWith('u-1')
  })

  it('falla cuando la cuenta no tiene un cliente', async () => {
    buscarCliente.mockResolvedValue(null)

    await expect(obtenerComprasDelCliente('cuenta-3')).rejects.toBeInstanceOf(ClienteInexistente)
    expect(buscarCompras).not.toHaveBeenCalled()
  })
})
