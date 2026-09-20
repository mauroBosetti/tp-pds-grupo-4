import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listarPaquetes, SinAutorizacion, type Paquete } from '@/api/paquetes'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ListaDePaquetes({ paquetes }: { paquetes: Paquete[] }) {
  if (paquetes.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Creá un paquete con el botón + para ofrecer vuelos de ida y vuelta a tus clientes.
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
          </span>
          <span className="font-medium">${paquete.precio}</span>
        </li>
      ))}
    </ul>
  )
}

export default function AgenciaHome() {
  const { usuario, cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()
  const [paquetes, setPaquetes] = useState<Paquete[] | null>(null)
  const [error, setError] = useState('')

  function salir() {
    cerrarSesion()
    navegar('/login')
  }

  useEffect(() => {
    listarPaquetes()
      .then(setPaquetes)
      .catch((fallo) => {
        if (fallo instanceof SinAutorizacion) {
          salir()
          return
        }
        setError('No se pudieron cargar los paquetes.')
      })
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Hola{usuario ? `, ${usuario.nombre}` : ''}</CardTitle>
              <CardDescription>Panel de agencia</CardDescription>
            </div>
            <Button
              type="button"
              size="icon"
              aria-label="Crear paquete"
              onClick={() => navegar('/agencia/paquetes/nuevo')}
            >
              <Plus />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {paquetes === null ? (
            <p className="text-sm text-muted-foreground">Cargando paquetes...</p>
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
