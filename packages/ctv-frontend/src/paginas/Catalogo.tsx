import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarCatalogo, SinAutorizacion, type PaqueteDeCatalogo } from '@/api/paquetes'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ListaDePaquetes({ paquetes }: { paquetes: PaqueteDeCatalogo[] }) {
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
          </span>
          <span className="font-medium">${paquete.precio}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Catalogo() {
  const { usuario, cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()
  const [paquetes, setPaquetes] = useState<PaqueteDeCatalogo[] | null>(null)
  const [error, setError] = useState('')

  function salir() {
    cerrarSesion()
    navegar('/login')
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
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hola{usuario ? `, ${usuario.nombre}` : ''}</CardTitle>
          <CardDescription>Catálogo de paquetes disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {paquetes === null ? (
            <p className="text-sm text-muted-foreground">Cargando catálogo...</p>
          ) : (
            <ListaDePaquetes paquetes={paquetes} />
          )}
          <Button type="button" variant="ghost" onClick={salir}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
