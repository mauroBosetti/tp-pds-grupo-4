import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarMisCompras, type Compra } from '@/api/compras'
import type { Opinion } from '@/api/opiniones'
import { SinAutorizacion } from '@/api/paquetes'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import FormularioDeOpinion from '@/components/FormularioDeOpinion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function formatearFecha(fechaIso: string) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { dateStyle: 'long' })
}

interface PropiedadesListaDeCompras {
  compras: Compra[]
  alOpinar: (paqueteId: string, opinion: Opinion) => void
  alExpirarSesion: () => void
}

function ListaDeCompras({ compras, alOpinar, alExpirarSesion }: PropiedadesListaDeCompras) {
  if (compras.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground text-center">
        Todavía no compraste ningún paquete.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {compras.map(({ id, fecha, paquete, opinion }) => (
        <li key={id} className="flex flex-col gap-3 rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex flex-col">
              <span className="font-medium">{paquete.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {paquete.origen} → {paquete.destino}
              </span>
              <span className="text-xs text-muted-foreground">{paquete.agencia.nombre}</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="font-medium">${paquete.precio}</span>
              <span className="text-xs text-muted-foreground">{formatearFecha(fecha)}</span>
            </span>
          </div>
          <FormularioDeOpinion
            paqueteId={paquete.id}
            opinionInicial={opinion}
            alGuardar={(opinionGuardada) => alOpinar(paquete.id, opinionGuardada)}
            alExpirarSesion={alExpirarSesion}
          />
        </li>
      ))}
    </ul>
  )
}

export default function MisCompras() {
  const { cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()
  const [compras, setCompras] = useState<Compra[] | null>(null)
  const [error, setError] = useState('')

  function expirarSesion() {
    cerrarSesion()
    navegar('/login')
  }

  function registrarOpinion(paqueteId: string, opinion: Opinion) {
    setCompras((actuales) =>
      actuales?.map((compra) =>
        compra.paquete.id === paqueteId ? { ...compra, opinion } : compra,
      ) ?? null,
    )
  }

  useEffect(() => {
    listarMisCompras()
      .then(setCompras)
      .catch((fallo) => {
        if (fallo instanceof SinAutorizacion) {
          expirarSesion()
          return
        }
        setError('No se pudieron cargar tus compras.')
      })
  }, [])

  return (
    <main className="flex flex-1 items-start justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Mis compras</CardTitle>
          <CardDescription>Los paquetes que ya compraste</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {compras === null ? (
            <p className="text-sm text-muted-foreground">Cargando compras...</p>
          ) : (
            <ListaDeCompras
              compras={compras}
              alOpinar={registrarOpinion}
              alExpirarSesion={expirarSesion}
            />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
