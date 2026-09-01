import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obtenerAgencia, type Agencia } from '../api/agencias'

type Estado =
  | { situacion: 'cargando' }
  | { situacion: 'listo'; agencia: Agencia }
  | { situacion: 'error'; mensaje: string }

export default function DetalleAgencia() {
  const { id } = useParams<{ id: string }>()
  const [estado, setEstado] = useState<Estado>({ situacion: 'cargando' })

  useEffect(() => {
    if (!id) return
    obtenerAgencia(id)
      .then((agencia) => setEstado({ situacion: 'listo', agencia }))
      .catch(() => setEstado({ situacion: 'error', mensaje: 'No se encontró la agencia.' }))
  }, [id])

  if (estado.situacion === 'cargando') {
    return <main><p>Cargando agencia...</p></main>
  }

  if (estado.situacion === 'error') {
    return <main><p role="alert">{estado.mensaje}</p></main>
  }

  return (
    <main>
      <h1>{estado.agencia.nombre}</h1>
      <p>Esta agencia todavía no tiene vuelos ni paquetes.</p>
    </main>
  )
}
