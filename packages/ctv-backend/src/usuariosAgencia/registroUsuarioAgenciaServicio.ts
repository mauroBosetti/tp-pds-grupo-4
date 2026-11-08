import bcrypt from 'bcryptjs'
import { buscarAgenciaPorCodigo } from '../agencias/agenciasRepositorio.js'
import { buscarCuentaPorEmail } from '../cuentas/cuentasRepositorio.js'
import { crearUsuarioAgencia } from './usuariosAgenciaRepositorio.js'

export class DatosDeRegistroInvalidos extends Error {
  constructor() {
    super('Nombre, email y contraseña son requeridos')
  }
}

export class CodigoDeGrupoInvalido extends Error {
  constructor() {
    super('El código de grupo no corresponde a ninguna agencia')
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

interface DatosDeRegistro {
  nombre: unknown
  email: unknown
  clave: unknown
  codigoDeGrupo: unknown
}

export async function registrarUsuarioAgencia({ nombre, email, clave, codigoDeGrupo }: DatosDeRegistro) {
  if (esTextoVacio(nombre) || esTextoVacio(email) || esTextoVacio(clave) || esTextoVacio(codigoDeGrupo)) {
    throw new DatosDeRegistroInvalidos()
  }

  const agencia = await buscarAgenciaPorCodigo((codigoDeGrupo as string).trim())
  if (!agencia) {
    throw new CodigoDeGrupoInvalido()
  }

  const emailNormalizado = (email as string).trim()
  if (await buscarCuentaPorEmail(emailNormalizado)) {
    throw new EmailYaRegistrado()
  }

  const hashClave = await bcrypt.hash(clave as string, 10)
  return crearUsuarioAgencia({
    nombre: (nombre as string).trim(),
    email: emailNormalizado,
    hashClave,
    agenciaId: agencia.id,
  })
}
