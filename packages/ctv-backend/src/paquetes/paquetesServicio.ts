import { crearPaquete, buscarPaquetesDeAgencia } from './paquetesRepositorio.js'

export class DatosDePaqueteInvalidos extends Error {
  constructor() {
    super('Los datos del paquete son inválidos')
  }
}

export interface DatosPaquete {
  nombre: unknown
  precio: unknown
  origen: unknown
  destino: unknown
  vueloIdaId: unknown
  vueloVueltaId: unknown
}

function esTextoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === ''
}

function esEnteroPositivo(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0
}

function esIdentificadorDeVuelo(valor: unknown): boolean {
  return typeof valor === 'number' && Number.isInteger(valor)
}

export async function registrarPaquete(datos: DatosPaquete, agenciaId: string) {
  const { nombre, precio, origen, destino, vueloIdaId, vueloVueltaId } = datos
  const hayCamposDeTextoVacios = [nombre, origen, destino].some(esTextoVacio)
  const hayVuelosInvalidos = ![vueloIdaId, vueloVueltaId].every(esIdentificadorDeVuelo)
  if (hayCamposDeTextoVacios || !esEnteroPositivo(precio) || hayVuelosInvalidos) {
    throw new DatosDePaqueteInvalidos()
  }
  return crearPaquete({
    nombre: (nombre as string).trim(),
    precio: precio as number,
    origen: (origen as string).trim(),
    destino: (destino as string).trim(),
    vueloIdaId: vueloIdaId as number,
    vueloVueltaId: vueloVueltaId as number,
    agenciaId,
  })
}

export function obtenerPaquetesDeAgencia(agenciaId: string) {
  return buscarPaquetesDeAgencia(agenciaId)
}
