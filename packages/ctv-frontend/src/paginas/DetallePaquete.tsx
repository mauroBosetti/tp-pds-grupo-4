import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import {
  obtenerDetalleDePaquete,
  SinAutorizacion,
  type ComentarioDePaquete,
  type DetalleDePaquete,
} from '@/api/paquetes'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import PuntajePromedio from '@/components/PuntajePromedio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ListaDeComentarios({ comentarios }: { comentarios: ComentarioDePaquete[] }) {
  if (comentarios.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground text-center">
        Todavía no hay comentarios para este paquete.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {comentarios.map(({ autor, puntaje, comentario }, indice) => (
        <li key={indice} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
          <span className="flex items-center justify-between">
            <span className="font-medium">{autor}</span>
            {puntaje !== null && (
              <span className="flex items-center gap-1 text-xs">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {puntaje}
              </span>
            )}
          </span>
          <span>{comentario}</span>
        </li>
      ))}
    </ul>
  )
}

export default function DetallePaquete() {
  const { id } = useParams()
  const { cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()
  const [paquete, setPaquete] = useState<DetalleDePaquete | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    obtenerDetalleDePaquete(id)
      .then(setPaquete)
      .catch((fallo) => {
        if (fallo instanceof SinAutorizacion) {
          cerrarSesion()
          navegar('/login')
          return
        }
        setError('No se pudo cargar el paquete.')
      })
  }, [id])

  return (
    <main className="flex flex-1 items-start justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <Link to="/catalogo" className="text-xs text-muted-foreground hover:text-foreground">
            ← Volver al catálogo
          </Link>
          <CardTitle>{paquete?.nombre ?? 'Paquete'}</CardTitle>
          {paquete && (
            <CardDescription>
              {paquete.origen} → {paquete.destino} · {paquete.agencia.nombre} · ${paquete.precio}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {paquete === null && !error && (
            <p className="text-sm text-muted-foreground">Cargando paquete...</p>
          )}
          {paquete && (
            <>
              <PuntajePromedio
                puntajePromedio={paquete.puntajePromedio}
                cantidadDePuntajes={paquete.cantidadDePuntajes}
              />
              <h2 className="text-sm font-medium">Comentarios</h2>
              <ListaDeComentarios comentarios={paquete.comentarios} />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
