import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerAgencia, type Agencia } from '@/api/agencias'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

type Estado =
  | { situacion: 'cargando' }
  | { situacion: 'listo'; agencia: Agencia }
  | { situacion: 'error'; mensaje: string }

function CodigoDeGrupo({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Código de grupo</Label>
      <p className="text-sm text-muted-foreground">
        Compartí este código para que los usuarios de la agencia se registren.
      </p>
      <div className="flex items-center gap-2">
        <span className="rounded-md border px-3 py-2 font-mono text-lg tracking-widest">
          {codigo}
        </span>
        <Button type="button" variant="outline" onClick={copiar}>
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </div>
  )
}

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
            {estado.agencia.codigoDeGrupo && (
              <CodigoDeGrupo codigo={estado.agencia.codigoDeGrupo} />
            )}
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Esta agencia todavía no tiene vuelos ni paquetes.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin">Crear otra agencia</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
