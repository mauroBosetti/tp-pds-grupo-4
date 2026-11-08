import { useState, type FormEvent } from 'react'
import { Star } from 'lucide-react'
import {
  guardarOpinion,
  PUNTAJE_MAXIMO,
  PUNTAJE_MINIMO,
  type Opinion,
} from '@/api/opiniones'
import { SinAutorizacion } from '@/api/paquetes'
import { Button } from '@/components/ui/button'

interface PropiedadesFormularioDeOpinion {
  paqueteId: string
  opinionInicial: Opinion | null
  alGuardar: (opinion: Opinion) => void
  alExpirarSesion: () => void
}

const puntajesPosibles = Array.from(
  { length: PUNTAJE_MAXIMO - PUNTAJE_MINIMO + 1 },
  (_, indice) => PUNTAJE_MINIMO + indice,
)

export default function FormularioDeOpinion({
  paqueteId,
  opinionInicial,
  alGuardar,
  alExpirarSesion,
}: PropiedadesFormularioDeOpinion) {
  const [puntaje, setPuntaje] = useState<number | null>(opinionInicial?.puntaje ?? null)
  const [comentario, setComentario] = useState(opinionInicial?.comentario ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [guardada, setGuardada] = useState(false)

  const estaVacia = puntaje === null && comentario.trim() === ''

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError('')
    setGuardada(false)
    setGuardando(true)
    try {
      const opinion = await guardarOpinion(paqueteId, {
        ...(puntaje !== null ? { puntaje } : {}),
        ...(comentario.trim() !== '' ? { comentario } : {}),
      })
      alGuardar(opinion)
      setGuardada(true)
    } catch (fallo) {
      if (fallo instanceof SinAutorizacion) {
        alExpirarSesion()
        return
      }
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar la opinión')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2 border-t pt-3">
      <div role="group" aria-label="Puntaje" className="flex items-center gap-1">
        {puntajesPosibles.map((valor) => (
          <button
            key={valor}
            type="button"
            aria-label={`${valor} ${valor === 1 ? 'estrella' : 'estrellas'}`}
            aria-pressed={puntaje === valor}
            onClick={() => setPuntaje(valor)}
            className="rounded p-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Star
              className={`size-5 ${
                puntaje !== null && valor <= puntaje
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        aria-label="Comentario"
        placeholder="Contanos cómo fue tu viaje"
        value={comentario}
        onChange={(evento) => setComentario(evento.target.value)}
        rows={2}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={guardando || estaVacia}>
          {guardando ? 'Guardando...' : 'Guardar opinión'}
        </Button>
        {guardada && (
          <span role="status" className="text-xs text-green-700">
            Opinión guardada
          </span>
        )}
        {error && (
          <span role="alert" className="text-xs text-destructive">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
