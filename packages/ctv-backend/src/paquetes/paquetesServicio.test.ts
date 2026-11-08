import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import {
  buscarOpinionesDePaquete,
  buscarPuntajesDeTodosLosPaquetes,
} from '../opiniones/opinionesRepositorio.js'
import { crearCompra } from '../compras/comprasRepositorio.js'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { venderVuelos } from '../vuelos/clienteVuelos.js'
import {
  DatosDePaqueteInvalidos,
  PaqueteInexistente,
  comprarPaquete,
  registrarPaquete,
  obtenerCatalogoDePaquetes,
  obtenerDetalleDePaquete,
} from './paquetesServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    paquete: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
  },
}))

vi.mock('../vuelos/clienteVuelos.js', () => ({ venderVuelos: vi.fn() }))
vi.mock('../opiniones/opinionesRepositorio.js', () => ({
  buscarOpinionesDePaquete: vi.fn(),
  buscarPuntajesDeTodosLosPaquetes: vi.fn(),
}))
vi.mock('../compras/comprasRepositorio.js', () => ({ crearCompra: vi.fn() }))
vi.mock('../usuariosCliente/usuariosClienteRepositorio.js', () => ({
  buscarUsuarioClientePorCuentaId: vi.fn(),
}))

const crearPaquete = vi.mocked(cliente.paquete.create)
const buscarPaquetes = vi.mocked(cliente.paquete.findMany)
const buscarPaquete = vi.mocked(cliente.paquete.findUnique)
const vender = vi.mocked(venderVuelos)
const buscarPuntajes = vi.mocked(buscarPuntajesDeTodosLosPaquetes)
const buscarOpiniones = vi.mocked(buscarOpinionesDePaquete)
const registrarCompra = vi.mocked(crearCompra)
const buscarCliente = vi.mocked(buscarUsuarioClientePorCuentaId)

const datosValidos = {
  nombre: 'Escapada a Madrid',
  precio: 1500,
  origen: 'Buenos Aires',
  destino: 'Madrid',
  vueloIdaId: 1,
  vueloVueltaId: 2,
}

describe('registrarPaquete', () => {
  beforeEach(() => {
    crearPaquete.mockReset()
  })

  const agenciaId = 'ag-1';
  it('falla cuando el nombre está vacío', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, nombre: '  ' }, agenciaId),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crearPaquete).not.toHaveBeenCalled()
  })

  it('falla cuando el precio no es un entero positivo', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, precio: 0 }, agenciaId),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crearPaquete).not.toHaveBeenCalled()
  })

  it('falla cuando falta un vuelo', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, vueloVueltaId: 'dos' }, agenciaId),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crearPaquete).not.toHaveBeenCalled()
  })

  it('crea el paquete asociándolo a la agencia del usuario', async () => {
    crearPaquete.mockResolvedValue({ id: 'p-1', ...datosValidos, agenciaId })

    await registrarPaquete(datosValidos, agenciaId)

    const argumentos = crearPaquete.mock.calls[0][0]
    expect(argumentos.data.nombre).toBe('Escapada a Madrid')
    expect(argumentos.data.vueloIdaId).toBe(1)
    expect(argumentos.data.vueloVueltaId).toBe(2)
    expect(argumentos.data.agencia).toEqual({ connect: { id: agenciaId } })
  })
})

describe('obtenerCatalogoDePaquetes', () => {
  beforeEach(() => {
    buscarPaquetes.mockReset()
  })

  it('devuelve los paquetes de todas las agencias con el nombre de cada agencia', async () => {
    const agenciaId = 'ag-1'
    buscarPaquetes.mockResolvedValue([
      { id: 'p-1', ...datosValidos, agenciaId, agencia: { id: agenciaId, nombre: 'Turismo Sur' } },
    ])
    buscarPuntajes.mockResolvedValue([])

    const catalogo = await obtenerCatalogoDePaquetes()

    expect(catalogo).toHaveLength(1)
    expect(catalogo[0].agencia).toEqual({ id: agenciaId, nombre: 'Turismo Sur' })
    expect(buscarPaquetes).toHaveBeenCalledWith({
      include: { agencia: { select: { id: true, nombre: true } } },
    })
  })
})

describe('comprarPaquete', () => {
  const paqueteExistente = { id: 'p-1', ...datosValidos, agenciaId: 'ag-1' }
  const usuarioCliente = { id: 'u-1', nombre: 'Clara', cuentaId: 'cuenta-3' }

  beforeEach(() => {
    buscarPaquete.mockReset()
    vender.mockReset()
    registrarCompra.mockReset()
    buscarCliente.mockReset()
  })

  it('vende los vuelos del paquete al cliente y registra la compra', async () => {
    buscarPaquete.mockResolvedValue(paqueteExistente)
    buscarCliente.mockResolvedValue(usuarioCliente)
    vender.mockResolvedValue({ id_venta: 7, pasajero: 'Clara', ids_vuelo: [1, 2] })

    const venta = await comprarPaquete('p-1', 'cuenta-3')

    expect(vender).toHaveBeenCalledWith([1, 2], 'Clara')
    expect(registrarCompra).toHaveBeenCalledWith({ usuarioClienteId: 'u-1', paqueteId: 'p-1' })
    expect(venta.id_venta).toBe(7)
  })

  it('no registra la compra cuando la venta de vuelos es rechazada', async () => {
    buscarPaquete.mockResolvedValue(paqueteExistente)
    buscarCliente.mockResolvedValue(usuarioCliente)
    vender.mockRejectedValue(new Error('sin disponibilidad'))

    await expect(comprarPaquete('p-1', 'cuenta-3')).rejects.toThrow('sin disponibilidad')
    expect(registrarCompra).not.toHaveBeenCalled()
  })

  it('falla sin vender nada cuando el paquete no existe', async () => {
    buscarPaquete.mockResolvedValue(null)

    await expect(comprarPaquete('inexistente', 'cuenta-3')).rejects.toBeInstanceOf(
      PaqueteInexistente,
    )
    expect(vender).not.toHaveBeenCalled()
  })

  it('falla sin vender nada cuando la cuenta no tiene un cliente', async () => {
    buscarPaquete.mockResolvedValue(paqueteExistente)
    buscarCliente.mockResolvedValue(null)

    await expect(comprarPaquete('p-1', 'cuenta-3')).rejects.toBeInstanceOf(ClienteInexistente)
    expect(vender).not.toHaveBeenCalled()
  })
})

describe('puntaje promedio en el catálogo', () => {
  it('suma a cada paquete el promedio de sus puntajes', async () => {
    const agencia = { id: 'ag-1', nombre: 'Turismo Sur' }
    buscarPaquetes.mockResolvedValue([
      { id: 'p-1', ...datosValidos, agenciaId: 'ag-1', agencia },
      { id: 'p-2', ...datosValidos, agenciaId: 'ag-1', agencia },
    ])
    buscarPuntajes.mockResolvedValue([
      { paqueteId: 'p-1', puntaje: 5 },
      { paqueteId: 'p-1', puntaje: 4 },
    ])

    const [conOpiniones, sinOpiniones] = await obtenerCatalogoDePaquetes()

    expect(conOpiniones).toMatchObject({ puntajePromedio: 4.5, cantidadDePuntajes: 2 })
    expect(sinOpiniones).toMatchObject({ puntajePromedio: null, cantidadDePuntajes: 0 })
  })
})

describe('obtenerDetalleDePaquete', () => {
  beforeEach(() => {
    buscarPaquete.mockReset()
    buscarOpiniones.mockReset()
  })

  it('devuelve el promedio y solo las opiniones que tienen comentario', async () => {
    buscarPaquete.mockResolvedValue({ id: 'p-1', ...datosValidos, agenciaId: 'ag-1' })
    buscarOpiniones.mockResolvedValue([
      { usuarioClienteId: 'u-1', paqueteId: 'p-1', favorito: false, puntaje: 5, comentario: 'Genial', usuarioCliente: { nombre: 'Clara' } },
      { usuarioClienteId: 'u-2', paqueteId: 'p-1', favorito: false, puntaje: 3, comentario: null, usuarioCliente: { nombre: 'Dani' } },
    ])

    const detalle = await obtenerDetalleDePaquete('p-1')

    expect(detalle).toMatchObject({ puntajePromedio: 4, cantidadDePuntajes: 2 })
    expect(detalle.comentarios).toEqual([{ autor: 'Clara', puntaje: 5, comentario: 'Genial' }])
  })

  it('falla cuando el paquete no existe', async () => {
    buscarPaquete.mockResolvedValue(null)

    await expect(obtenerDetalleDePaquete('x')).rejects.toBeInstanceOf(PaqueteInexistente)
  })
})
