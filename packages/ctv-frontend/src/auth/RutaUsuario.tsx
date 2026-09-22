import { Navigate, Outlet } from 'react-router-dom'
import { useAuthUsuario } from './AuthUsuarioContext'

export default function RutaUsuario() {
  const { estaAutenticado } = useAuthUsuario()
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
