import { Outlet } from 'react-router-dom'
import BarraDeNavegacion from '@/components/BarraDeNavegacion'

export default function LayoutUsuario() {
  return (
    <div className="flex min-h-screen flex-col">
      <BarraDeNavegacion />
      <Outlet />
    </div>
  )
}
