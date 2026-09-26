import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthAdministradorProvider } from './auth/AuthAdministradorContext'
import { AuthUsuarioProvider } from './auth/AuthUsuarioContext'
import RutaAdministrador from './auth/RutaAdministrador'
import RutaUsuario from './auth/RutaUsuario'
import LoginAdministrador from './paginas/LoginAdministrador'
import LoginUsuario from './paginas/LoginUsuario'
import Catalogo from './paginas/Catalogo'
import AgenciaHome from './paginas/AgenciaHome'
import CrearPaquete from './paginas/CrearPaquete'
import CrearAgencia from './paginas/CrearAgencia'
import DetalleAgencia from './paginas/DetalleAgencia'

export default function App() {
  return (
    <AuthAdministradorProvider>
      <AuthUsuarioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/login" element={<LoginAdministrador />} />
            <Route element={<RutaAdministrador />}>
              <Route path="/admin" element={<CrearAgencia />} />
            </Route>
            <Route path="/login" element={<LoginUsuario />} />
            <Route path="/registro" element={<Navigate to="/login?modo=registro" replace />} />
            <Route element={<RutaUsuario />}>
              <Route path="/agencia" element={<AgenciaHome />} />
              <Route path="/agencia/paquetes/nuevo" element={<CrearPaquete />} />
              <Route path="/catalogo" element={<Catalogo />} />
            </Route>
            <Route path="/agencias/:id" element={<DetalleAgencia />} />
          </Routes>
        </BrowserRouter>
      </AuthUsuarioProvider>
    </AuthAdministradorProvider>
  )
}
