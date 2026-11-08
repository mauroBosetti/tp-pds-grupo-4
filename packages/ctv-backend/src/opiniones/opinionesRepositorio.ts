import { cliente } from '../db/cliente.js'

interface DatosOpinion {
  usuarioClienteId: string
  paqueteId: string
  comentario: string | null
  puntaje: number | null
}

export function guardarOpinion({ usuarioClienteId, paqueteId, comentario, puntaje }: DatosOpinion) {
  return cliente.opinion.upsert({
    where: { usuarioClienteId_paqueteId: { usuarioClienteId, paqueteId } },
    create: { usuarioClienteId, paqueteId, comentario, puntaje },
    update: { comentario, puntaje },
  })
}

export function buscarOpinionesDeCliente(usuarioClienteId: string) {
  return cliente.opinion.findMany({ where: { usuarioClienteId } })
}

export function buscarPuntajesDeTodosLosPaquetes() {
  return cliente.opinion.findMany({
    where: { puntaje: { not: null } },
    select: { paqueteId: true, puntaje: true },
  })
}

export function buscarOpinionesDePaquete(paqueteId: string) {
  return cliente.opinion.findMany({
    where: { paqueteId },
    include: { usuarioCliente: { select: { nombre: true } } },
  })
}
