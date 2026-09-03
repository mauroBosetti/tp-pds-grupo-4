import { Navigate, Outlet } from 'react-router-dom'
import { useAuthAdministrador } from './AuthAdministradorContext'

export default function RutaAdministrador() {
  const { estaAutenticado } = useAuthAdministrador()
  if (!estaAutenticado) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}
