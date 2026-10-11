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
