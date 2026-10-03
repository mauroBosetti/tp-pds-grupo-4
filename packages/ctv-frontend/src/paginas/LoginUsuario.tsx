import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CredencialesInvalidas } from '@/api/autenticacion'
import {
  CodigoDeGrupoInvalido,
  EmailYaRegistrado as EmailAgenciaRegistrado,
  registrarUsuarioAgencia,
} from '@/api/usuariosAgencia'
import {
  DatosInvalidos,
  EmailYaRegistrado as EmailClienteRegistrado,
  registrarUsuarioCliente,
} from '@/api/usuariosCliente'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Rol = 'cliente' | 'agencia'
type Modo = 'login' | 'registro'

export default function LoginUsuario() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rolInicial: Rol = searchParams.get('rol') === 'agencia' ? 'agencia' : 'cliente'
  const modoInicial: Modo = searchParams.get('modo') === 'registro' ? 'registro' : 'login'

  const [rol, setRol] = useState<Rol>(rolInicial)
  const [modo, setModo] = useState<Modo>(modoInicial)

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [codigoDeGrupo, setCodigoDeGrupo] = useState('')

  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const { iniciarSesionAgencia, iniciarSesionCliente } = useAuthUsuario()
  const navegar = useNavigate()

  function cambiarRol(nuevoRol: Rol) {
    setRol(nuevoRol)
    setError('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('rol', nuevoRol)
      return next
    })
  }

  function cambiarModo(nuevoModo: Modo) {
    setModo(nuevoModo)
    setError('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('modo', nuevoModo)
      return next
    })
  }

  const camposIncompletos =
    modo === 'login'
      ? email.trim() === '' || clave === ''
      : rol === 'cliente'
        ? nombre.trim() === '' || email.trim() === '' || clave === ''
        : nombre.trim() === '' || email.trim() === '' || clave === '' || codigoDeGrupo.trim() === ''

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault()
    setError('')
    setEnviando(true)

    try {
      if (modo === 'login') {
        if (rol === 'cliente') {
          await iniciarSesionCliente(email, clave)
          navegar('/catalogo')
        } else {
          await iniciarSesionAgencia(email, clave)
          navegar('/agencia')
        }
      } else {
        if (rol === 'cliente') {
          await registrarUsuarioCliente({ nombre, email, clave })
          await iniciarSesionCliente(email, clave)
          navegar('/catalogo')
        } else {
          await registrarUsuarioAgencia({ nombre, email, clave, codigoDeGrupo })
          await iniciarSesionAgencia(email, clave)
          navegar('/agencia')
        }
      }
    } catch (fallo) {
      if (fallo instanceof CredencialesInvalidas) {
        setError('Email o contraseña incorrectos.')
      } else if (fallo instanceof CodigoDeGrupoInvalido) {
        setError('El código de grupo no corresponde a ninguna agencia.')
      } else if (fallo instanceof EmailAgenciaRegistrado || fallo instanceof EmailClienteRegistrado) {
        setError('Ya existe una cuenta con ese email.')
      } else if (fallo instanceof DatosInvalidos) {
        setError('Por favor completá todos los campos requeridos.')
      } else {
        setError(
          modo === 'login'
            ? 'No se pudo iniciar sesión. Intentá de nuevo.'
            : 'No se pudo completar el registro. Intentá de nuevo.',
        )
      }
      setEnviando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex rounded-lg bg-muted p-1 mb-2">
            <button
              type="button"
              role="tab"
              aria-selected={rol === 'cliente'}
              onClick={() => cambiarRol('cliente')}
              className={cn(
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-all cursor-pointer',
                rol === 'cliente'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Cliente
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rol === 'agencia'}
              onClick={() => cambiarRol('agencia')}
              className={cn(
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-all cursor-pointer',
                rol === 'agencia'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Agencia
            </button>
          </div>

          <div className="flex border-b border-border mb-2">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'login'}
              onClick={() => cambiarModo('login')}
              className={cn(
                'flex-1 pb-2 text-sm font-medium border-b-2 text-center transition-colors cursor-pointer',
                modo === 'login'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'registro'}
              onClick={() => cambiarModo('registro')}
              className={cn(
                'flex-1 pb-2 text-sm font-medium border-b-2 text-center transition-colors cursor-pointer',
                modo === 'registro'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              Registrarse
            </button>
          </div>

          <CardTitle>
            {modo === 'login'
              ? `Ingresar como ${rol === 'cliente' ? 'cliente' : 'agencia'}`
              : `Registro de ${rol === 'cliente' ? 'cliente' : 'agencia'}`}
          </CardTitle>
          <CardDescription>
            {modo === 'login'
              ? rol === 'cliente'
                ? 'Ingresá con tu cuenta para descubrir y comprar paquetes.'
                : 'Ingresá con tu cuenta de agencia para administrar tus paquetes.'
              : rol === 'cliente'
                ? 'Creá tu cuenta de cliente y empezá a viajar.'
                : 'Creá tu cuenta con el código de grupo que te dio la agencia.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            {modo === 'registro' && (
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
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder={rol === 'cliente' ? 'tu@email.com' : 'tu@agencia.com'}
                autoFocus={modo === 'login'}
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
            {modo === 'registro' && rol === 'agencia' && (
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
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={enviando || camposIncompletos}>
              {enviando
                ? modo === 'login'
                  ? 'Ingresando...'
                  : 'Creando cuenta...'
                : modo === 'login'
                  ? 'Ingresar'
                  : 'Crear cuenta'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {modo === 'login' ? (
                <>
                  ¿No tenés cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => cambiarModo('registro')}
                    className="underline underline-offset-4 cursor-pointer text-foreground"
                  >
                    Registrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tenés cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => cambiarModo('login')}
                    className="underline underline-offset-4 cursor-pointer text-foreground"
                  >
                    Ingresá
                  </button>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
