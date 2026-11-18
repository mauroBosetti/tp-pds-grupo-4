import { buscarTodosLosUsuarios } from './usuariosRepositorio.js'

export function obtenerUsuariosRegistrados() {
  return buscarTodosLosUsuarios()
}
