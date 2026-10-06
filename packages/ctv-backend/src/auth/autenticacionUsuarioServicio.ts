import { validarCredenciales } from './autenticacionServicio.js'
import { firmarToken } from './token.js'
import { buscarUsuarioAgenciaPorCuentaId } from '../usuariosAgencia/usuariosAgenciaRepositorio.js'
import { buscarUsuarioClientePorCuentaId } from '../usuariosCliente/usuariosClienteRepositorio.js'

export class NoEsUsuarioAgencia extends Error {
  constructor() {
    super('La cuenta no corresponde a un usuario de agencia')
  }
}

export class NoEsUsuarioCliente extends Error {
  constructor() {
    super('La cuenta no corresponde a un usuario cliente')
  }
}

export async function iniciarSesionAgencia(email: unknown, clave: unknown) {
  const cuenta = await validarCredenciales(email, clave)

  const usuarioAgencia = await buscarUsuarioAgenciaPorCuentaId(cuenta.id)
  if (!usuarioAgencia) {
    throw new NoEsUsuarioAgencia()
  }

  const token = firmarToken({
    sub: cuenta.id,
    rol: 'agencia',
    nombre: usuarioAgencia.nombre,
    agenciaId: usuarioAgencia.agenciaId,
  })

  return {
    token,
    usuario: { nombre: usuarioAgencia.nombre, email: cuenta.email, rol: 'agencia' as const },
  }
}

export async function iniciarSesionCliente(email: unknown, clave: unknown) {
  const cuenta = await validarCredenciales(email, clave)

  const usuarioCliente = await buscarUsuarioClientePorCuentaId(cuenta.id)
  if (!usuarioCliente) {
    throw new NoEsUsuarioCliente()
  }

  const token = firmarToken({
    sub: cuenta.id,
    rol: 'cliente',
    nombre: usuarioCliente.nombre,
  })

  return {
    token,
    usuario: { nombre: usuarioCliente.nombre, email: cuenta.email, rol: 'cliente' as const },
  }
}
