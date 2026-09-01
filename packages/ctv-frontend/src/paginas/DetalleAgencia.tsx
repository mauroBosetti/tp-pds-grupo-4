import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerAgencia, type Agencia } from '@/api/agencias'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      {estado.situacion === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando agencia...</p>
      )}
      {estado.situacion === 'error' && (
        <p role="alert" className="text-sm text-destructive">{estado.mensaje}</p>
      )}
      {estado.situacion === 'listo' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{estado.agencia.nombre}</CardTitle>
            <CardDescription>Agencia</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Esta agencia todavía no tiene vuelos ni paquetes.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Crear otra agencia</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
