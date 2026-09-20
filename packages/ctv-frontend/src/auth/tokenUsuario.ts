import type { UsuarioSesion } from '@/api/autenticacion'

const CLAVE_TOKEN = 'ctv.token.usuario'
const CLAVE_USUARIO = 'ctv.usuario'

export function leerTokenUsuario(): string | null {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function guardarTokenUsuario(token: string): void {
  localStorage.setItem(CLAVE_TOKEN, token)
}

export function borrarTokenUsuario(): void {
  localStorage.removeItem(CLAVE_TOKEN)
}

export function leerUsuario(): UsuarioSesion | null {
  const guardado = localStorage.getItem(CLAVE_USUARIO)
  return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null
}

export function guardarUsuario(usuario: UsuarioSesion): void {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

export function borrarUsuario(): void {
  localStorage.removeItem(CLAVE_USUARIO)
}
