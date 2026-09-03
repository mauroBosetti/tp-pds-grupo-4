import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthAdministradorProvider } from './auth/AuthAdministradorContext'
import RutaAdministrador from './auth/RutaAdministrador'
import LoginAdministrador from './paginas/LoginAdministrador'
import CrearAgencia from './paginas/CrearAgencia'
import DetalleAgencia from './paginas/DetalleAgencia'

export default function App() {
  return (
    <AuthAdministradorProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/login" element={<LoginAdministrador />} />
          <Route element={<RutaAdministrador />}>
            <Route path="/admin" element={<CrearAgencia />} />
          </Route>
          <Route path="/agencias/:id" element={<DetalleAgencia />} />
        </Routes>
      </BrowserRouter>
    </AuthAdministradorProvider>
  )
}
