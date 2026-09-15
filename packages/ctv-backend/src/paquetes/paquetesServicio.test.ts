import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cliente } from '../db/cliente.js'
import { DatosDePaqueteInvalidos, registrarPaquete } from './paquetesServicio.js'

vi.mock('../db/cliente.js', () => ({
  cliente: {
    paquete: { create: vi.fn() },
  },
}))

const crear = vi.mocked(cliente.paquete.create)

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
    crear.mockReset()
  })

  it('falla cuando el nombre está vacío', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, nombre: '  ' }, 'ag-1'),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crear).not.toHaveBeenCalled()
  })

  it('falla cuando el precio no es un entero positivo', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, precio: 0 }, 'ag-1'),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crear).not.toHaveBeenCalled()
  })

  it('falla cuando falta un vuelo', async () => {
    await expect(
      registrarPaquete({ ...datosValidos, vueloVueltaId: 'dos' }, 'ag-1'),
    ).rejects.toBeInstanceOf(DatosDePaqueteInvalidos)
    expect(crear).not.toHaveBeenCalled()
  })

  it('crea el paquete asociándolo a la agencia del usuario', async () => {
    crear.mockResolvedValue({ id: 'p-1', ...datosValidos, agenciaId: 'ag-1' })

    await registrarPaquete(datosValidos, 'ag-1')

    const argumentos = crear.mock.calls[0][0]
    expect(argumentos.data.nombre).toBe('Escapada a Madrid')
    expect(argumentos.data.vueloIdaId).toBe(1)
    expect(argumentos.data.vueloVueltaId).toBe(2)
    expect(argumentos.data.agencia).toEqual({ connect: { id: 'ag-1' } })
  })
})
