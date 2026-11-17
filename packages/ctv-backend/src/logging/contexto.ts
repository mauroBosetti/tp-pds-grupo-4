import { AsyncLocalStorage } from 'node:async_hooks'

interface ContextoDePeticion {
  requestId: string
}

const almacen = new AsyncLocalStorage<ContextoDePeticion>()

export function ejecutarConContexto<T>(contexto: ContextoDePeticion, funcion: () => T): T {
  return almacen.run(contexto, funcion)
}

export function obtenerRequestId(): string | undefined {
  return almacen.getStore()?.requestId
}