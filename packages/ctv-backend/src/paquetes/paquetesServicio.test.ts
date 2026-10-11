import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import { venderVuelos } from '../vuelos/clienteVuelos.js'
import {
  DatosDePaqueteInvalidos,
  PaqueteInexistente,
  comprarPaquete,
  registrarPaquete,
  obtenerCatalogoDePaquetes,
} from './paquetesServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    paquete: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
  },
}))

vi.mock('../vuelos/clienteVuelos.js', () => ({ venderVuelos: vi.fn() }))

const crearPaquete = vi.mocked(cliente.paquete.create)
const buscarPaquetes = vi.mocked(cliente.paquete.findMany)
const buscarPaquete = vi.mocked(cliente.paquete.findUnique)
const vender = vi.mocked(venderVuelos)

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

    const catalogo = await obtenerCatalogoDePaquetes()

    expect(catalogo).toHaveLength(1)
    expect(catalogo[0].agencia).toEqual({ id: agenciaId, nombre: 'Turismo Sur' })
    expect(buscarPaquetes).toHaveBeenCalledWith({
      include: { agencia: { select: { id: true, nombre: true } } },
    })
  })
})

describe('comprarPaquete', () => {
  beforeEach(() => {
    buscarPaquete.mockReset()
    vender.mockReset()
  })

  it('vende los vuelos de ida y vuelta del paquete al pasajero', async () => {
    buscarPaquete.mockResolvedValue({ id: 'p-1', ...datosValidos, agenciaId: 'ag-1' })
    vender.mockResolvedValue({ id_venta: 7, pasajero: 'Clara', ids_vuelo: [1, 2] })

    const venta = await comprarPaquete('p-1', 'Clara')

    expect(vender).toHaveBeenCalledWith([1, 2], 'Clara')
    expect(venta.id_venta).toBe(7)
  })

  it('falla sin vender nada cuando el paquete no existe', async () => {
    buscarPaquete.mockResolvedValue(null)

    await expect(comprarPaquete('inexistente', 'Clara')).rejects.toBeInstanceOf(PaqueteInexistente)
    expect(vender).not.toHaveBeenCalled()
  })
})
