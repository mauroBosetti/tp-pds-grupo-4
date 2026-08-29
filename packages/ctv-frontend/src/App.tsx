import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function App() {
  const [mensaje, setMensaje] = useState('Cargando...')

  useEffect(() => {
    fetch(`${API_URL}/hola`)
      .then((res) => res.text())
      .then(setMensaje)
      .catch(() => setMensaje('Error al conectar con el backend'))
  }, [])

  return (
    <main>
      <h1>CTV Frontend</h1>
      <p>Respuesta del backend: {mensaje}</p>
    </main>
  )
}
