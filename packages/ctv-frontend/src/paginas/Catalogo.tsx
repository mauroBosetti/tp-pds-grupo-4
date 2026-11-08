import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { comprarPaquete, listarCatalogo, SinAutorizacion, type PaqueteDeCatalogo } from '@/api/paquetes'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import PuntajePromedio from '@/components/PuntajePromedio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PropiedadesListaDePaquetes {
  paquetes: PaqueteDeCatalogo[]
  paqueteComprandoId: string | null
  alComprar: (paquete: PaqueteDeCatalogo) => void
  alVerMas: (paquete: PaqueteDeCatalogo) => void
}

function ListaDePaquetes({
  paquetes,
  paqueteComprandoId,
  alComprar,
  alVerMas,
}: PropiedadesListaDePaquetes) {
  if (paquetes.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground text-center">
        Todavía no hay paquetes disponibles.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {paquetes.map((paquete) => (
        <li
          key={paquete.id}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <span className="flex flex-col">
            <span className="font-medium">{paquete.nombre}</span>
            <span className="text-xs text-muted-foreground">
              {paquete.origen} → {paquete.destino}
            </span>
            <span className="text-xs text-muted-foreground">{paquete.agencia.nombre}</span>
            <PuntajePromedio
              puntajePromedio={paquete.puntajePromedio}
              cantidadDePuntajes={paquete.cantidadDePuntajes}
            />
          </span>
          <span className="flex flex-col items-end gap-2">
            <span className="font-medium">${paquete.precio}</span>
            <span className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => alVerMas(paquete)}>
                Ver más
              </Button>
              <Button
                type="button"
                size="sm"
                  disabled={paqueteComprandoId !== null}
                onClick={() => alComprar(paquete)}
              >
                {paqueteComprandoId === paquete.id ? 'Comprando...' : 'Comprar'}
              </Button>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function Catalogo() {
  const { cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()
  const [paquetes, setPaquetes] = useState<PaqueteDeCatalogo[] | null>(null)
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [paqueteComprandoId, setPaqueteComprandoId] = useState<string | null>(null)

  function salir() {
    cerrarSesion()
    navegar('/login')
  }

  async function comprar(paquete: PaqueteDeCatalogo) {
    setError('')
    setConfirmacion('')
    setPaqueteComprandoId(paquete.id)
    try {
      await comprarPaquete(paquete.id)
      setConfirmacion(`¡Compraste "${paquete.nombre}"!`)
    } catch (fallo) {
      if (fallo instanceof SinAutorizacion) {
        salir()
        return
      }
      setError(fallo instanceof Error ? fallo.message : 'No se pudo completar la compra')
    } finally {
      setPaqueteComprandoId(null)
    }
  }

  useEffect(() => {
    listarCatalogo()
      .then(setPaquetes)
      .catch((fallo) => {
        if (fallo instanceof SinAutorizacion) {
          salir()
          return
        }
        setError('No se pudo cargar el catálogo.')
      })
  }, [])

  return (
    <main className="flex flex-1 items-start justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Catálogo de paquetes</CardTitle>
          <CardDescription>Elegí un paquete para comprar sus vuelos de ida y vuelta</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {confirmacion && (
            <p role="status" className="text-sm text-green-700">
              {confirmacion}
            </p>
          )}
          {paquetes === null ? (
            <p className="text-sm text-muted-foreground">Cargando catálogo...</p>
          ) : (
            <ListaDePaquetes
              paquetes={paquetes}
              paqueteComprandoId={paqueteComprandoId}
              alComprar={comprar}
              alVerMas={(paquete) => navegar(`/paquetes/${paquete.id}`)}
            />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
