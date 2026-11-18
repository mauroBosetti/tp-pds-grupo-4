import { Outlet } from 'react-router-dom'
import BarraDeNavegacionAdmin from '@/components/BarraDeNavegacionAdmin'

export default function LayoutAdministrador() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <BarraDeNavegacionAdmin />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
