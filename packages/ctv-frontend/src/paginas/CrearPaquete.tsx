import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buscarVuelos, crearPaquete, SinAutorizacion, type Vuelo } from '@/api/paquetes'
import { listarHoteles, type Hotel } from '@/api/hoteles'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ListaDeVuelos({
  titulo,
  vuelos,
  vueloElegido,
  alElegir,
}: {
  titulo: string
  vuelos: Vuelo[]
  vueloElegido: number | null
  alElegir: (idVuelo: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{titulo}</p>
      {vuelos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay vuelos disponibles para ese tramo.</p>
      ) : (
        vuelos.map((vuelo) => (
          <Button
            key={vuelo.id_vuelo}
            type="button"
            variant={vueloElegido === vuelo.id_vuelo ? 'default' : 'outline'}
            className="h-auto justify-start py-2 text-left"
            onClick={() => alElegir(vuelo.id_vuelo)}
          >
            <span className="flex flex-col">
              <span>
                {vuelo.origen} → {vuelo.destino} · {vuelo.aerolinea}
              </span>
              <span className="text-xs text-muted-foreground">
                {vuelo.fecha} {vuelo.hora}
              </span>
            </span>
          </Button>
        ))
      )}
    </div>
  )
}

export default function CrearPaquete() {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [origen, setOrigen] = useState('')
  const [destino, setDestino] = useState('')
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [vuelosIda, setVuelosIda] = useState<Vuelo[] | null>(null)
  const [vuelosVuelta, setVuelosVuelta] = useState<Vuelo[] | null>(null)
  const [vueloIdaId, setVueloIdaId] = useState<number | null>(null)
  const [vueloVueltaId, setVueloVueltaId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const { cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()

  useEffect(() => {
    listarHoteles()
      .then(setHoteles)
      .catch((fallo) => {
        if (fallo instanceof SinAutorizacion) {
          volverAlLogin()
        }
      })
  }, [])

  const precioNumerico = Number(precio)
  const precioValido = Number.isInteger(precioNumerico) && precioNumerico > 0
  const noSePuedeBuscar = origen.trim() === '' || destino.trim() === ''
  const noSePuedeCrear =
    nombre.trim() === '' || !precioValido || vueloIdaId === null || vueloVueltaId === null || hotelId === null

  function volverAlLogin() {
    cerrarSesion()
    navegar('/login')
  }

  async function buscar() {
    setError('')
    setBuscando(true)
    setVueloIdaId(null)
    setVueloVueltaId(null)
    try {
      const [ida, vuelta] = await Promise.all([
        buscarVuelos(origen, destino),
        buscarVuelos(destino, origen),
      ])
      setVuelosIda(ida)
      setVuelosVuelta(vuelta)
    } catch (fallo) {
      if (fallo instanceof SinAutorizacion) {
        volverAlLogin()
        return
      }
      setError('No se pudieron obtener los vuelos. Intentá de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    if (vueloIdaId === null || vueloVueltaId === null || hotelId === null) {
      return
    }
    setError('')
    setEnviando(true)
    try {
      await crearPaquete({
        nombre,
        precio: precioNumerico,
        origen,
        destino,
        vueloIdaId,
        vueloVueltaId,
        hotelId,
      })
      navegar('/agencia')
    } catch (fallo) {
      if (fallo instanceof SinAutorizacion) {
        volverAlLogin()
        return
      }
      setError('No se pudo crear el paquete. Intentá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear paquete</CardTitle>
          <CardDescription>
            Cargá los datos del paquete y elegí los vuelos de ida y vuelta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                placeholder="Escapada a Madrid"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                min={1}
                value={precio}
                onChange={(evento) => setPrecio(evento.target.value)}
                placeholder="1500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="origen">Origen</Label>
              <Input
                id="origen"
                value={origen}
                onChange={(evento) => setOrigen(evento.target.value)}
                placeholder="Buenos Aires"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                value={destino}
                onChange={(evento) => setDestino(evento.target.value)}
                placeholder="Madrid"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="hotel">Hotel</Label>
              <select
                id="hotel"
                value={hotelId ?? ''}
                onChange={(evento) => setHotelId(evento.target.value || null)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {hoteles.length === 0 ? 'No hay hoteles disponibles' : 'Seleccioná un hotel'}
                </option>
                {hoteles.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.nombre} — {hotel.ciudad}, {hotel.pais} ({hotel.direccion})
                  </option>
                ))}
              </select>
            </div>

            <Button type="button" variant="secondary" onClick={buscar} disabled={buscando || noSePuedeBuscar}>
              {buscando ? 'Buscando vuelos...' : 'Buscar vuelos'}
            </Button>

            {vuelosIda !== null && vuelosVuelta !== null && (
              <>
                <ListaDeVuelos
                  titulo="Vuelo de ida"
                  vuelos={vuelosIda}
                  vueloElegido={vueloIdaId}
                  alElegir={setVueloIdaId}
                />
                <ListaDeVuelos
                  titulo="Vuelo de vuelta"
                  vuelos={vuelosVuelta}
                  vueloElegido={vueloVueltaId}
                  alElegir={setVueloVueltaId}
                />
              </>
            )}

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={enviando || noSePuedeCrear}>
              {enviando ? 'Creando...' : 'Crear paquete'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navegar('/agencia')}>
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
