import { validarCredenciales } from '../auth/autenticacionServicio.js'
import { firmarToken } from '../auth/token.js'
import { buscarAdministradorPorCuentaId } from './usuariosAdministradoresRepositorio.js'

export class NoEsAdministrador extends Error {
  constructor() {
    super('La cuenta no corresponde a un administrador')
  }
}

export async function iniciarSesionAdministrador(email: unknown, clave: unknown) {
  const cuenta = await validarCredenciales(email, clave)
  const administrador = await buscarAdministradorPorCuentaId(cuenta.id)
  if (!administrador) {
    throw new NoEsAdministrador()
  }
  const token = firmarToken({ sub: cuenta.id, rol: 'administrador', nombre: administrador.nombre })
  return { token, administrador: { nombre: administrador.nombre, email: cuenta.email } }
}
