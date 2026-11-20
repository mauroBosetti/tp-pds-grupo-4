import { cliente } from '../db/cliente.js'

export async function buscarTodosLosUsuarios() {
  const [clientes, agencias, administradores] = await Promise.all([
    cliente.usuarioCliente.findMany({
      include: { cuenta: { select: { email: true } } },
      orderBy: { nombre: 'asc' },
    }),
    cliente.usuarioAgencia.findMany({
      include: {
        cuenta: { select: { email: true } },
        agencia: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: 'asc' },
    }),
    cliente.usuarioAdministrador.findMany({
      include: { cuenta: { select: { email: true } } },
      orderBy: { nombre: 'asc' },
    }),
  ])

  return [
    ...clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      email: c.cuenta.email,
      rol: 'cliente' as const,
      agencia: null,
    })),
    ...agencias.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      email: a.cuenta.email,
      rol: 'agencia' as const,
      agencia: a.agencia.nombre,
    })),
    ...administradores.map((adm) => ({
      id: adm.id,
      nombre: adm.nombre,
      email: adm.cuenta.email,
      rol: 'administrador' as const,
      agencia: null,
    })),
  ]
}
