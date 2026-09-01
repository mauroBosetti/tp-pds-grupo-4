import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearAgencia } from '../api/agencias'

export default function CrearAgencia() {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const agencia = await crearAgencia(nombre)
      navegar(`/agencias/${agencia.id}`)
    } catch {
      setError('No se pudo crear la agencia. Intentá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Crear agencia</h1>
      <form onSubmit={manejarEnvio}>
        <label>
          Nombre
          <input
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Nombre de la agencia"
          />
        </label>
        <button type="submit" disabled={enviando || nombre.trim() === ''}>
          Crear
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}
