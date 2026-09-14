import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CredencialesInvalidas } from '@/api/autenticacion'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginUsuario() {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { iniciarSesion } = useAuthUsuario()
  const navegar = useNavigate()

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(email, clave)
      navegar('/agencia')
    } catch (fallo) {
      setError(
        fallo instanceof CredencialesInvalidas
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Intentá de nuevo.',
      )
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingresar</CardTitle>
          <CardDescription>Ingresá con tu cuenta de agencia.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder="tu@agencia.com"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clave">Contraseña</Label>
              <Input
                id="clave"
                type="password"
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={enviando || email.trim() === '' || clave === ''}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="underline underline-offset-4">
                Registrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
