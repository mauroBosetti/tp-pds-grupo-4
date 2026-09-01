import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CrearAgencia from './paginas/CrearAgencia'
import DetalleAgencia from './paginas/DetalleAgencia'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CrearAgencia />} />
        <Route path="/agencias/:id" element={<DetalleAgencia />} />
      </Routes>
    </BrowserRouter>
  )
}
