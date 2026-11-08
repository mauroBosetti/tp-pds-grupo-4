import { Star } from 'lucide-react'
import type { ResumenDePuntajes } from '@/api/paquetes'

export default function PuntajePromedio({ puntajePromedio, cantidadDePuntajes }: ResumenDePuntajes) {
  if (puntajePromedio === null) {
    return <span className="text-xs text-muted-foreground">Sin opiniones todavía</span>
  }
  return (
    <span className="flex items-center gap-1 text-xs">
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium">{puntajePromedio.toFixed(1)}</span>
      <span className="text-muted-foreground">
        ({cantidadDePuntajes} {cantidadDePuntajes === 1 ? 'opinión' : 'opiniones'})
      </span>
    </span>
  )
}
