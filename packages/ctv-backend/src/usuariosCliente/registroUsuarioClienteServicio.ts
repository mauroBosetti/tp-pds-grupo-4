import bcrypt from 'bcryptjs'
import { buscarCuentaPorEmail } from '../cuentas/cuentasRepositorio.js'
import { crearUsuarioCliente } from './usuariosClienteRepositorio.js'

export class DatosDeRegistroInvalidos extends Error {
  constructor() {
    super('Nombre, email y contraseña son requeridos')
  }
}

export class EmailYaRegistrado extends Error {
  constructor() {
    super('Ya existe una cuenta con ese email')
  }
}

function esTextoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === ''
}

interface DatosDeRegistroCliente {
  nombre: unknown
  email: unknown
  clave: unknown
}

export async function registrarUsuarioCliente({ nombre, email, clave }: DatosDeRegistroCliente) {
  if (esTextoVacio(nombre) || esTextoVacio(email) || esTextoVacio(clave)) {
    throw new DatosDeRegistroInvalidos()
  }

  const emailNormalizado = (email as string).trim()
  if (await buscarCuentaPorEmail(emailNormalizado)) {
    throw new EmailYaRegistrado()
  }

  const hashClave = await bcrypt.hash(clave as string, 10)
  return crearUsuarioCliente({
    nombre: (nombre as string).trim(),
    email: emailNormalizado,
    hashClave,
  })
}
