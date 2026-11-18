import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Building2,
  BookmarkCheck,
  Star,
  ShoppingBag,
  TrendingUp,
  Award,
  MapPin,
  Briefcase,
  PlusCircle,
} from 'lucide-react'
import {
  obtenerUsuarios,
  obtenerAgencias,
  obtenerPaquetesDeInteres,
  obtenerPuntajesYObservaciones,
  obtenerTodasLasCompras,
  obtenerReportes,
  SinAutorizacion,
  type UsuarioRegistrado,
  type AgenciaRegistrada,
  type PaqueteDeInteres,
  type OpinionDetalle,
  type CompraRegistrada,
  type ReportesUtilizacion,
} from '@/api/admin'
import { useAuthAdministrador } from '@/auth/AuthAdministradorContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Seccion = 'reportes' | 'usuarios' | 'compras' | 'interes' | 'opiniones'

export default function AdminDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('reportes')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [reportes, setReportes] = useState<ReportesUtilizacion | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioRegistrado[]>([])
  const [agencias, setAgencias] = useState<AgenciaRegistrada[]>([])
  const [compras, setCompras] = useState<CompraRegistrada[]>([])
  const [paquetesInteres, setPaquetesInteres] = useState<PaqueteDeInteres[]>([])
  const [opiniones, setOpiniones] = useState<OpinionDetalle[]>([])

  const { cerrarSesion } = useAuthAdministrador()
  const navegar = useNavigate()

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      try {
        const [rep, usr, agc, cmp, fav, opi] = await Promise.all([
          obtenerReportes(),
          obtenerUsuarios(),
          obtenerAgencias(),
          obtenerTodasLasCompras(),
          obtenerPaquetesDeInteres(),
          obtenerPuntajesYObservaciones(),
        ])
        setReportes(rep)
        setUsuarios(usr)
        setAgencias(agc)
        setCompras(cmp)
        setPaquetesInteres(fav)
        setOpiniones(opi)
      } catch (fallo) {
        if (fallo instanceof SinAutorizacion) {
          cerrarSesion()
          navegar('/admin/login')
          return
        }
        setError('No se pudieron cargar los datos del panel de administración.')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [cerrarSesion, navegar])

  if (cargando) {
    return (
      <main className="mx-auto flex max-w-7xl items-center justify-center p-12">
        <p className="text-muted-foreground animate-pulse text-base">Cargando datos del panel...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Encabezado y acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">
            Consultas generales, reportes de utilización y gestión del sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={() => navegar('/admin/agencias/nueva')}
          >
            <Building2 className="size-4" />
            Nueva Agencia
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md bg-destructive/10 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Pestañas de navegación de consultas */}
      <div className="flex overflow-x-auto border-b text-sm gap-2 pb-1">
        <button
          type="button"
          onClick={() => setSeccionActiva('reportes')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
            seccionActiva === 'reportes'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <TrendingUp className="size-4" />
          Reportes (Top 5)
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('usuarios')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
            seccionActiva === 'usuarios'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Users className="size-4" />
          Usuarios y Agencias ({usuarios.length + agencias.length})
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('compras')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
            seccionActiva === 'compras'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ShoppingBag className="size-4" />
          Compras ({compras.length})
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('interes')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
            seccionActiva === 'interes'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <BookmarkCheck className="size-4" />
          Paquetes de Interés ({paquetesInteres.length})
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('opiniones')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors ${
            seccionActiva === 'opiniones'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Star className="size-4" />
          Puntajes y Observaciones ({opiniones.length})
        </button>
      </div>

      {/* SECCIÓN 1: REPORTES DE UTILIZACIÓN */}
      {seccionActiva === 'reportes' && reportes && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top 5 Usuarios con más compras */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-amber-500" />
                  <CardTitle className="text-lg">Usuarios con más compras (Top 5)</CardTitle>
                </div>
                <CardDescription>Clientes con mayor cantidad de compras registradas.</CardDescription>
              </CardHeader>
              <CardContent>
                {reportes.topCompradores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay compras registradas aún.</p>
                ) : (
                  <ol className="divide-y text-sm">
                    {reportes.topCompradores.map((usr, i) => (
                      <li key={usr.id} className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {i + 1}
                          </span>
                          <span>
                            <span className="font-medium block">{usr.nombre}</span>
                            <span className="text-xs text-muted-foreground">{usr.email}</span>
                          </span>
                        </span>
                        <span className="font-semibold text-primary">
                          {usr.cantidadCompras} {usr.cantidadCompras === 1 ? 'compra' : 'compras'}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Top 5 Destinos mejores rankeados */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="size-5 text-amber-500 fill-amber-500" />
                  <CardTitle className="text-lg">Destinos mejores rankeados (Top 5)</CardTitle>
                </div>
                <CardDescription>Destinos con mejores calificaciones promedio de usuarios.</CardDescription>
              </CardHeader>
              <CardContent>
                {reportes.topDestinosRankeados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay puntajes registrados todavía.</p>
                ) : (
                  <ol className="divide-y text-sm">
                    {reportes.topDestinosRankeados.map((item, i) => (
                      <li key={item.destino} className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {i + 1}
                          </span>
                          <span className="font-medium">{item.destino}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          <span>{item.puntajePromedio.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            ({item.cantidadOpiniones} {item.cantidadOpiniones === 1 ? 'opinión' : 'opiniones'})
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Top 5 Agencias con más ventas */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="size-5 text-blue-500" />
                  <CardTitle className="text-lg">Agencias con más ventas (Top 5)</CardTitle>
                </div>
                <CardDescription>Agencias con mayor volumen de paquetes vendidos.</CardDescription>
              </CardHeader>
              <CardContent>
                {reportes.topAgencias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay ventas registradas todavía.</p>
                ) : (
                  <ol className="divide-y text-sm">
                    {reportes.topAgencias.map((agencia, i) => (
                      <li key={agencia.id} className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {i + 1}
                          </span>
                          <span className="font-medium">{agencia.nombre}</span>
                        </span>
                        <span className="font-semibold text-primary">
                          {agencia.cantidadVentas} {agencia.cantidadVentas === 1 ? 'venta' : 'ventas'}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Top 5 Destinos más vendidos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-emerald-500" />
                  <CardTitle className="text-lg">Destinos más vendidos (Top 5)</CardTitle>
                </div>
                <CardDescription>Lugares con mayor cantidad de paquetes adquiridos.</CardDescription>
              </CardHeader>
              <CardContent>
                {reportes.topDestinosVendidos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay destinos con ventas aún.</p>
                ) : (
                  <ol className="divide-y text-sm">
                    {reportes.topDestinosVendidos.map((dest, i) => (
                      <li key={dest.destino} className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted font-bold text-xs">
                            {i + 1}
                          </span>
                          <span className="font-medium">{dest.destino}</span>
                        </span>
                        <span className="font-semibold text-emerald-600">
                          {dest.cantidadVentas} {dest.cantidadVentas === 1 ? 'paquete' : 'paquetes'}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: USUARIOS Y AGENCIAS */}
      {seccionActiva === 'usuarios' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuarios Registrados ({usuarios.length})</CardTitle>
              <CardDescription>Todos los usuarios dados de alta en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {usuarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground uppercase">
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Rol</th>
                        <th className="py-2">Agencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/40">
                          <td className="py-2.5 font-medium">{u.nombre}</td>
                          <td className="py-2.5 text-muted-foreground">{u.email}</td>
                          <td className="py-2.5">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                                u.rol === 'administrador'
                                  ? 'bg-purple-100 text-purple-700'
                                  : u.rol === 'agencia'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.rol}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted-foreground">{u.agencia ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agencias */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Agencias Registradas ({agencias.length})</CardTitle>
                <CardDescription>Agencias autorizadas para publicar paquetes.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => navegar('/admin/agencias/nueva')}>
                <PlusCircle className="size-3.5 mr-1" />
                Nueva
              </Button>
            </CardHeader>
            <CardContent>
              {agencias.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay agencias registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground uppercase">
                        <th className="py-2">Nombre</th>
                        <th className="py-2">Código de Grupo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agencias.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/40">
                          <td className="py-2.5 font-medium">{a.nombre}</td>
                          <td className="py-2.5 font-mono text-xs">{a.codigoDeGrupo ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SECCIÓN 3: COMPRAS REALIZADAS */}
      {seccionActiva === 'compras' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compras Realizadas ({compras.length})</CardTitle>
            <CardDescription>Historial de todas las compras de paquetes en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {compras.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no se realizaron compras.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase">
                      <th className="py-2">Fecha</th>
                      <th className="py-2">Comprador</th>
                      <th className="py-2">Paquete</th>
                      <th className="py-2">Destino</th>
                      <th className="py-2">Agencia</th>
                      <th className="py-2 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {compras.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/40">
                        <td className="py-2.5 text-muted-foreground text-xs">
                          {new Date(c.fecha).toLocaleString()}
                        </td>
                        <td className="py-2.5">
                          <span className="font-medium block">{c.usuarioCliente.nombre}</span>
                          <span className="text-xs text-muted-foreground">{c.usuarioCliente.cuenta.email}</span>
                        </td>
                        <td className="py-2.5 font-medium">{c.paquete.nombre}</td>
                        <td className="py-2.5">{c.paquete.destino}</td>
                        <td className="py-2.5 text-muted-foreground">{c.paquete.agencia.nombre}</td>
                        <td className="py-2.5 font-semibold text-right">${c.paquete.precio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 4: PAQUETES DE INTERÉS GUARDADOS */}
      {seccionActiva === 'interes' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paquetes de Interés Guardados ({paquetesInteres.length})</CardTitle>
            <CardDescription>Paquetes guardados como favoritos por los clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            {paquetesInteres.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay paquetes guardados como favoritos aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase">
                      <th className="py-2">Usuario</th>
                      <th className="py-2">Paquete</th>
                      <th className="py-2">Destino</th>
                      <th className="py-2">Agencia</th>
                      <th className="py-2 text-right">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paquetesInteres.map((item, idx) => (
                      <tr key={`${item.usuarioClienteId}-${item.paqueteId}-${idx}`} className="hover:bg-muted/40">
                        <td className="py-2.5">
                          <span className="font-medium block">{item.usuarioCliente.nombre}</span>
                          <span className="text-xs text-muted-foreground">{item.usuarioCliente.cuenta.email}</span>
                        </td>
                        <td className="py-2.5 font-medium">{item.paquete.nombre}</td>
                        <td className="py-2.5">{item.paquete.destino}</td>
                        <td className="py-2.5 text-muted-foreground">{item.paquete.agencia.nombre}</td>
                        <td className="py-2.5 font-semibold text-right">${item.paquete.precio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECCIÓN 5: PUNTAJES Y OBSERVACIONES */}
      {seccionActiva === 'opiniones' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Puntajes y Observaciones ({opiniones.length})</CardTitle>
            <CardDescription>Calificaciones y comentarios emitidos por los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            {opiniones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no se emitieron opiniones ni puntajes.</p>
            ) : (
              <div className="space-y-4">
                {opiniones.map((op, idx) => (
                  <div
                    key={`${op.usuarioClienteId}-${op.paqueteId}-${idx}`}
                    className="rounded-lg border p-4 text-sm space-y-2 bg-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div>
                        <span className="font-semibold text-foreground">{op.paquete.nombre}</span>
                        <span className="text-xs text-muted-foreground ml-2">({op.paquete.destino} · {op.paquete.agencia.nombre})</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-amber-500">
                        {op.puntaje !== null ? (
                          <>
                            <Star className="size-4 fill-amber-500" />
                            <span>{op.puntaje} / 5</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground font-normal">Sin puntaje</span>
                        )}
                      </div>
                    </div>
                    {op.comentario && (
                      <p className="text-muted-foreground italic">"{op.comentario}"</p>
                    )}
                    <div className="text-xs text-muted-foreground text-right">
                      Por: <span className="font-medium text-foreground">{op.usuarioCliente.nombre}</span> ({op.usuarioCliente.cuenta.email})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
