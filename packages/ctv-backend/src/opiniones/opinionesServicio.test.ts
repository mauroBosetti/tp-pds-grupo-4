import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clienteComproPaquete } from '../compras/comprasRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { guardarOpinion } from './opinionesRepositorio.js'
import {
  DatosDeOpinionInvalidos,
  PaqueteNoComprado,
  opinarSobrePaquete,
} from './opinionesServicio.js'

vi.mock('../compras/comprasRepositorio.js', () => ({ clienteComproPaquete: vi.fn() }))
vi.mock('../usuariosCliente/usuariosClienteRepositorio.js', () => ({
  buscarUsuarioClientePorCuentaId: vi.fn(),
}))
vi.mock('./opinionesRepositorio.js', () => ({ guardarOpinion: vi.fn() }))

const comproPaquete = vi.mocked(clienteComproPaquete)
const buscarCliente = vi.mocked(buscarUsuarioClientePorCuentaId)
const guardar = vi.mocked(guardarOpinion)

describe('opinarSobrePaquete', () => {
  beforeEach(() => {
    comproPaquete.mockReset().mockResolvedValue(true)
    buscarCliente.mockReset().mockResolvedValue({ id: 'u-1', nombre: 'Clara', cuentaId: 'cuenta-3' })
    guardar.mockReset()
  })

  it('guarda el puntaje y el comentario sin espacios sobrantes', async () => {
    await opinarSobrePaquete('cuenta-3', 'p-1', { puntaje: 4, comentario: '  Muy bueno  ' })

    expect(guardar).toHaveBeenCalledWith({
      usuarioClienteId: 'u-1',
      paqueteId: 'p-1',
      puntaje: 4,
      comentario: 'Muy bueno',
    })
  })

  it('permite opinar solo con puntaje o solo con comentario', async () => {
    await opinarSobrePaquete('cuenta-3', 'p-1', { puntaje: 5 })
    await opinarSobrePaquete('cuenta-3', 'p-1', { comentario: 'Lindo viaje' })

    expect(guardar).toHaveBeenNthCalledWith(1, expect.objectContaining({ puntaje: 5, comentario: null }))
    expect(guardar).toHaveBeenNthCalledWith(2, expect.objectContaining({ puntaje: null, comentario: 'Lindo viaje' }))
  })

  it.each([
    ['puntaje menor a 1', { puntaje: 0 }],
    ['puntaje mayor a 5', { puntaje: 6 }],
    ['puntaje no entero', { puntaje: 3.5 }],
    ['puntaje que no es número', { puntaje: '4' }],
    ['comentario que no es texto', { puntaje: 3, comentario: 10 }],
    ['opinión vacía', { comentario: '   ' }],
  ])('rechaza %s', async (_caso, datos) => {
    await expect(opinarSobrePaquete('cuenta-3', 'p-1', datos)).rejects.toBeInstanceOf(
      DatosDeOpinionInvalidos,
    )
    expect(guardar).not.toHaveBeenCalled()
  })

  it('rechaza opinar sobre un paquete que el cliente no compró', async () => {
    comproPaquete.mockResolvedValue(false)

    await expect(opinarSobrePaquete('cuenta-3', 'p-1', { puntaje: 5 })).rejects.toBeInstanceOf(
      PaqueteNoComprado,
    )
    expect(guardar).not.toHaveBeenCalled()
  })

  it('falla cuando la cuenta no tiene un cliente', async () => {
    buscarCliente.mockResolvedValue(null)

    await expect(opinarSobrePaquete('cuenta-3', 'p-1', { puntaje: 5 })).rejects.toBeInstanceOf(
      ClienteInexistente,
    )
  })
})
