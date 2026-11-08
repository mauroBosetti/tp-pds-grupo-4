import { cliente } from '../db/cliente.js'

interface DatosNuevoUsuarioAgencia {
  nombre: string
  email: string
  hashClave: string
  agenciaId: string
}

export function crearUsuarioAgencia({ nombre, email, hashClave, agenciaId }: DatosNuevoUsuarioAgencia) {
  return cliente.usuarioAgencia.create({
    data: {
      nombre,
      agencia: { connect: { id: agenciaId } },
      cuenta: { create: { email, hashClave } },
    },
  })
}

export function buscarUsuarioAgenciaPorCuentaId(cuentaId: string) {
  return cliente.usuarioAgencia.findUnique({ where: { cuentaId } })
}
