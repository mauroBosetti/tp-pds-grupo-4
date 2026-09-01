const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export interface Agencia {
  id: string
  nombre: string
  codigoDeGrupo: string | null
}

export async function crearAgencia(nombre: string): Promise<Agencia> {
  const respuesta = await fetch(`${API_URL}/agencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre }),
  })
  if (!respuesta.ok) {
    throw new Error('No se pudo crear la agencia')
  }
  return respuesta.json()
}

export async function obtenerAgencia(id: string): Promise<Agencia> {
  const respuesta = await fetch(`${API_URL}/agencias/${id}`)
  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la agencia')
  }
  return respuesta.json()
}
