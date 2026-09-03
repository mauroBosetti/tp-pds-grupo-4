const CLAVE_ALMACENAMIENTO = 'ctv.token.administrador'

export function leerTokenAdministrador(): string | null {
  return localStorage.getItem(CLAVE_ALMACENAMIENTO)
}

export function guardarTokenAdministrador(token: string): void {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, token)
}

export function borrarTokenAdministrador(): void {
  localStorage.removeItem(CLAVE_ALMACENAMIENTO)
}
