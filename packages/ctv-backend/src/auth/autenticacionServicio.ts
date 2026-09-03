import bcrypt from 'bcryptjs'
import { buscarCuentaPorEmail } from '../cuentas/cuentasRepositorio.js'

export class CredencialesInvalidas extends Error {
  constructor() {
    super('Email o contraseña incorrectos')
  }
}

function esTextoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === ''
}

export async function validarCredenciales(email: unknown, clave: unknown) {
  if (esTextoVacio(email) || esTextoVacio(clave)) {
    throw new CredencialesInvalidas()
  }
  const cuenta = await buscarCuentaPorEmail((email as string).trim())
  if (!cuenta) {
    throw new CredencialesInvalidas()
  }
  const claveCoincide = await bcrypt.compare(clave as string, cuenta.hashClave)
  if (!claveCoincide) {
    throw new CredencialesInvalidas()
  }
  return cuenta
}
