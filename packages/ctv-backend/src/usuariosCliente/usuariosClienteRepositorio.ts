import { cliente } from '../db/cliente.js'

interface DatosNuevoUsuarioCliente {
  nombre: string
  email: string
  hashClave: string
}

export function crearUsuarioCliente({ nombre, email, hashClave }: DatosNuevoUsuarioCliente) {
  return cliente.usuarioCliente.create({
    data: {
      nombre,
      cuenta: { create: { email, hashClave } },
    },
  })
}

export function buscarUsuarioClientePorCuentaId(cuentaId: string) {
  return cliente.usuarioCliente.findUnique({ where: { cuentaId } })
}
