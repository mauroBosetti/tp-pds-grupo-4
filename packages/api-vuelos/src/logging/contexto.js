import {AsyncLocalStorage} from "node:async_hooks";

const almacen = new AsyncLocalStorage();

export const ejecutarConContexto = (contexto, funcion) => almacen.run(contexto, funcion);
export const obtenerRequestId = () => almacen.getStore()?.requestId;