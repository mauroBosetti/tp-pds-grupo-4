import { useNavigate } from 'react-router-dom'
import { useAuthUsuario } from '@/auth/AuthUsuarioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Catalogo() {
  const { usuario, cerrarSesion } = useAuthUsuario()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/login')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hola{usuario ? `, ${usuario.nombre}` : ''}</CardTitle>
          <CardDescription>Catálogo de paquetes disponibles</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground text-center">
            Próximamente vas a poder explorar y reservar paquetes turísticos desde acá.
          </p>
          <Button type="button" variant="ghost" onClick={salir}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
