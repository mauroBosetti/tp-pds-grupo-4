import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearAgencia } from '@/api/agencias'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CrearAgencia() {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const agencia = await crearAgencia(nombre)
      navegar(`/agencias/${agencia.id}`)
    } catch {
      setError('No se pudo crear la agencia. Intentá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear agencia</CardTitle>
          <CardDescription>Registrá una nueva agencia con su nombre.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                placeholder="Nombre de la agencia"
                autoFocus
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={enviando || nombre.trim() === ''}>
              {enviando ? 'Creando...' : 'Crear'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
