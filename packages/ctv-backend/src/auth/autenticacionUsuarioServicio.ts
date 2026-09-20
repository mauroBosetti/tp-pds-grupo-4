import { validarCredenciales } from './autenticacionServicio.js'
import { firmarToken } from './token.js'
import { buscarUsuarioAgenciaPorCuentaId } from '../usuariosAgencia/usuariosAgenciaRepositorio.js'

export class CuentaSinRol extends Error {
  constructor() {
    super('La cuenta no tiene un rol de usuario')
  }
}

export async function iniciarSesionUsuario(email: unknown, clave: unknown) {
  const cuenta = await validarCredenciales(email, clave)

  const usuarioAgencia = await buscarUsuarioAgenciaPorCuentaId(cuenta.id)
  if (usuarioAgencia) {
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

  throw new CuentaSinRol()
}
