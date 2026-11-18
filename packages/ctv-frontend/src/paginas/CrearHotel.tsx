import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearHotel, SinAutorizacion } from '@/api/hoteles'
import { useAuthAdministrador } from '@/auth/AuthAdministradorContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CrearHotel() {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [pais, setPais] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [imagen, setImagen] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { cerrarSesion } = useAuthAdministrador()
  const navegar = useNavigate()

  const formularioIncompleto =
    nombre.trim() === '' ||
    direccion.trim() === '' ||
    pais.trim() === '' ||
    ciudad.trim() === '' ||
    imagen.trim() === ''

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await crearHotel({ nombre, direccion, pais, ciudad, imagen })
      navegar('/admin')
    } catch (fallo) {
      if (fallo instanceof SinAutorizacion) {
        cerrarSesion()
        navegar('/admin/login')
        return
      }
      setError('No se pudo crear el hotel. Intentá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear hotel</CardTitle>
          <CardDescription>Registrá un nuevo hotel con sus datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del hotel"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección del hotel"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                placeholder="País"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ciudad"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="imagen">Imagen</Label>
              <Input
                id="imagen"
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="https://..."
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={enviando || formularioIncompleto}>
              {enviando ? 'Creando...' : 'Crear'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                cerrarSesion()
                navegar('/admin/login')
              }}
            >
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
