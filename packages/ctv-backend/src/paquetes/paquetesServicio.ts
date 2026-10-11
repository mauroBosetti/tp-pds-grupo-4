import { crearCompra } from '../compras/comprasRepositorio.js'
import {
  buscarOpinionesDePaquete,
  buscarPuntajesDeTodosLosPaquetes,
} from '../opiniones/opinionesRepositorio.js'
import { resumirPuntajes } from '../opiniones/resumenDePuntajes.js'
import { ClienteInexistente } from '../usuariosCliente/clienteInexistente.js'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'
import { venderVuelos } from '../vuelos/clienteVuelos.js'
import {
  crearPaquete,
  buscarPaquetesDeAgencia,
  buscarTodosLosPaquetes,
  buscarPaquetePorId,
  buscarPaqueteConAgencia,
} from './paquetesRepositorio.js'

export class PaqueteInexistente extends Error {
  constructor() {
    super('El paquete no existe')
  }
}

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

export async function obtenerCatalogoDePaquetes() {
  const [paquetes, puntajes] = await Promise.all([
    buscarTodosLosPaquetes(),
    buscarPuntajesDeTodosLosPaquetes(),
  ])
  return paquetes.map((paquete) => {
    const puntajesDelPaquete = puntajes
      .filter(({ paqueteId }) => paqueteId === paquete.id)
      .map(({ puntaje }) => puntaje as number)
    return { ...paquete, ...resumirPuntajes(puntajesDelPaquete) }
  })
}

export async function obtenerDetalleDePaquete(paqueteId: string) {
  const paquete = await buscarPaqueteConAgencia(paqueteId)
  if (!paquete) {
    throw new PaqueteInexistente()
  }
  const opiniones = await buscarOpinionesDePaquete(paqueteId)
  const puntajes = opiniones.flatMap(({ puntaje }) => (puntaje === null ? [] : [puntaje]))
  const comentarios = opiniones.flatMap(({ comentario, puntaje, usuarioCliente }) =>
    comentario === null ? [] : [{ autor: usuarioCliente.nombre, puntaje, comentario }],
  )
  return { ...paquete, ...resumirPuntajes(puntajes), comentarios }
}

export async function comprarPaquete(paqueteId: string, cuentaId: string) {
  const paquete = await buscarPaquetePorId(paqueteId)
  if (!paquete) {
    throw new PaqueteInexistente()
  }
  const usuarioCliente = await buscarUsuarioClientePorCuentaId(cuentaId)
  if (!usuarioCliente) {
    throw new ClienteInexistente()
  }
  const venta = await venderVuelos(
    [paquete.vueloIdaId, paquete.vueloVueltaId],
    usuarioCliente.nombre,
  )
  await crearCompra({ usuarioClienteId: usuarioCliente.id, paqueteId })
  return venta
}
