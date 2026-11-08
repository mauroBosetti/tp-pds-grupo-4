const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface DatosRegistroUsuarioCliente {
  nombre: string
  email: string
  clave: string
}

export class DatosInvalidos extends Error {}
export class EmailYaRegistrado extends Error {}

export async function registrarUsuarioCliente(datos: DatosRegistroUsuarioCliente): Promise<void> {
  const respuesta = await fetch(`${API_URL}/api/auth/cliente/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (respuesta.ok) {
    return
  }
  if (respuesta.status === 400) {
    throw new DatosInvalidos('Nombre, email y contraseña son requeridos')
  }
  if (respuesta.status === 409) {
    throw new EmailYaRegistrado('Ya existe una cuenta con ese email')
  }
  throw new Error('No se pudo completar el registro')
}
