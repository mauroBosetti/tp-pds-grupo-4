import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CredencialesInvalidas } from '@/api/autenticacion'
import { useAuthAdministrador } from '@/auth/AuthAdministradorContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginAdministrador() {
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { iniciarSesion } = useAuthAdministrador()
  const navegar = useNavigate()

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(email, clave)
      navegar('/admin')
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
          <CardTitle>Panel de administración</CardTitle>
          <CardDescription>Ingresá con tu cuenta de administrador.</CardDescription>
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
                placeholder="admin@ctv.com"
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
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
