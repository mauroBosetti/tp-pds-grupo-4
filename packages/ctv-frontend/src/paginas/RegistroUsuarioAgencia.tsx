import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CodigoDeGrupoInvalido,
  EmailYaRegistrado,
  registrarUsuarioAgencia,
} from '@/api/usuariosAgencia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegistroUsuarioAgencia() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [codigoDeGrupo, setCodigoDeGrupo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  const camposIncompletos =
    nombre.trim() === '' || email.trim() === '' || clave === '' || codigoDeGrupo.trim() === ''

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await registrarUsuarioAgencia({ nombre, email, clave, codigoDeGrupo })
      navegar('/login')
    } catch (fallo) {
      if (fallo instanceof CodigoDeGrupoInvalido) {
        setError('El código de grupo no corresponde a ninguna agencia.')
      } else if (fallo instanceof EmailYaRegistrado) {
        setError('Ya existe una cuenta con ese email.')
      } else {
        setError('No se pudo completar el registro. Intentá de nuevo.')
      }
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro de agencia</CardTitle>
          <CardDescription>
            Creá tu cuenta con el código de grupo que te dio la agencia.
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
                placeholder="Tu nombre"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder="tu@agencia.com"
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="codigoDeGrupo">Código de grupo</Label>
              <Input
                id="codigoDeGrupo"
                inputMode="numeric"
                maxLength={8}
                value={codigoDeGrupo}
                onChange={(evento) => setCodigoDeGrupo(evento.target.value)}
                placeholder="12345678"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={enviando || camposIncompletos}>
              {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="underline underline-offset-4">
                Ingresá
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
