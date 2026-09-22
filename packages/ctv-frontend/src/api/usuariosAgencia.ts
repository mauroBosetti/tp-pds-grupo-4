const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface DatosRegistroUsuarioAgencia {
  nombre: string
  email: string
  clave: string
  codigoDeGrupo: string
}

export class CodigoDeGrupoInvalido extends Error {}
export class EmailYaRegistrado extends Error {}

export async function registrarUsuarioAgencia(datos: DatosRegistroUsuarioAgencia): Promise<void> {
  const respuesta = await fetch(`${API_URL}/auth/agencia/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (respuesta.ok) {
    return
  }
  if (respuesta.status === 400) {
    throw new CodigoDeGrupoInvalido('El código de grupo no es válido')
  }
  if (respuesta.status === 409) {
    throw new EmailYaRegistrado('Ya existe una cuenta con ese email')
  }
  throw new Error('No se pudo completar el registro')
}
