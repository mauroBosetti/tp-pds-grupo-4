import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminDashboard from './AdminDashboard'
import { AuthAdministradorProvider } from '@/auth/AuthAdministradorContext'
import * as apiAdmin from '@/api/admin'

function renderizar() {
  return render(
    <AuthAdministradorProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    </AuthAdministradorProvider>,
  )
}

const reportesMock = {
  topCompradores: [{ id: 'u1', nombre: 'Carlos Cliente', email: 'carlos@mail.com', cantidadCompras: 3 }],
  topDestinosRankeados: [{ destino: 'Cancún', puntajePromedio: 4.9, cantidadOpiniones: 12 }],
  topAgencias: [{ id: 'ag1', nombre: 'Turismo Sol', cantidadVentas: 8 }],
  topDestinosVendidos: [{ destino: 'Bariloche', cantidadVentas: 15 }],
}

const usuariosMock: apiAdmin.UsuarioRegistrado[] = [
  { id: '1', nombre: 'Carlos Cliente', email: 'carlos@mail.com', rol: 'cliente', agencia: null },
  { id: '2', nombre: 'Agente Bruno', email: 'bruno@mail.com', rol: 'agencia', agencia: 'Turismo Sol' },
]

const agenciasMock: apiAdmin.AgenciaRegistrada[] = [
  { id: 'ag1', nombre: 'Turismo Sol', codigoDeGrupo: 'SOL12345' },
]

const comprasMock: apiAdmin.CompraRegistrada[] = [
  {
    id: 'c1',
    fecha: '2026-11-10T12:00:00Z',
    usuarioCliente: { nombre: 'Carlos Cliente', cuenta: { email: 'carlos@mail.com' } },
    paquete: {
      id: 'p1',
      nombre: 'Semana en Cancún',
      precio: 2000,
      destino: 'Cancún',
      agencia: { id: 'ag1', nombre: 'Turismo Sol' },
    },
  },
]

const paquetesInteresMock: apiAdmin.PaqueteDeInteres[] = [
  {
    usuarioClienteId: 'u1',
    paqueteId: 'p1',
    favorito: true,
    usuarioCliente: { nombre: 'Carlos Cliente', cuenta: { email: 'carlos@mail.com' } },
    paquete: {
      id: 'p1',
      nombre: 'Semana en Cancún',
      precio: 2000,
      destino: 'Cancún',
      agencia: { nombre: 'Turismo Sol' },
    },
  },
]

const opinionesMock: apiAdmin.OpinionDetalle[] = [
  {
    usuarioClienteId: 'u1',
    paqueteId: 'p1',
    puntaje: 5,
    comentario: 'Increíble viaje',
    usuarioCliente: { nombre: 'Carlos Cliente', cuenta: { email: 'carlos@mail.com' } },
    paquete: {
      id: 'p1',
      nombre: 'Semana en Cancún',
      destino: 'Cancún',
      agencia: { id: 'ag1', nombre: 'Turismo Sol' },
    },
  },
]

describe('AdminDashboard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra el panel y carga los reportes de utilización (Top 5)', async () => {
    vi.spyOn(apiAdmin, 'obtenerReportes').mockResolvedValue(reportesMock)
    vi.spyOn(apiAdmin, 'obtenerUsuarios').mockResolvedValue(usuariosMock)
    vi.spyOn(apiAdmin, 'obtenerAgencias').mockResolvedValue(agenciasMock)
    vi.spyOn(apiAdmin, 'obtenerTodasLasCompras').mockResolvedValue(comprasMock)
    vi.spyOn(apiAdmin, 'obtenerPaquetesDeInteres').mockResolvedValue(paquetesInteresMock)
    vi.spyOn(apiAdmin, 'obtenerPuntajesYObservaciones').mockResolvedValue(opinionesMock)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    })

    // Reportes Top 5
    expect(screen.getByText('Usuarios con más compras (Top 5)')).toBeInTheDocument()
    expect(screen.getByText('Destinos mejores rankeados (Top 5)')).toBeInTheDocument()
    expect(screen.getByText('Agencias con más ventas (Top 5)')).toBeInTheDocument()
    expect(screen.getByText('Destinos más vendidos (Top 5)')).toBeInTheDocument()

    expect(screen.getByText('Bariloche')).toBeInTheDocument()
    expect(screen.getByText('Cancún')).toBeInTheDocument()
    expect(screen.getByText('Turismo Sol')).toBeInTheDocument()
  })

  it('permite cambiar a la pestaña de Usuarios y Agencias', async () => {
    vi.spyOn(apiAdmin, 'obtenerReportes').mockResolvedValue(reportesMock)
    vi.spyOn(apiAdmin, 'obtenerUsuarios').mockResolvedValue(usuariosMock)
    vi.spyOn(apiAdmin, 'obtenerAgencias').mockResolvedValue(agenciasMock)
    vi.spyOn(apiAdmin, 'obtenerTodasLasCompras').mockResolvedValue(comprasMock)
    vi.spyOn(apiAdmin, 'obtenerPaquetesDeInteres').mockResolvedValue(paquetesInteresMock)
    vi.spyOn(apiAdmin, 'obtenerPuntajesYObservaciones').mockResolvedValue(opinionesMock)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    })

    const botonUsuarios = screen.getByRole('button', { name: /Usuarios y Agencias/i })
    await userEvent.click(botonUsuarios)

    expect(screen.getByText('Usuarios Registrados (2)')).toBeInTheDocument()
    expect(screen.getByText('Agencias Registradas (1)')).toBeInTheDocument()
    expect(screen.getByText('Agente Bruno')).toBeInTheDocument()
    expect(screen.getByText('SOL12345')).toBeInTheDocument()
  })

  it('permite cambiar a la pestaña de Compras', async () => {
    vi.spyOn(apiAdmin, 'obtenerReportes').mockResolvedValue(reportesMock)
    vi.spyOn(apiAdmin, 'obtenerUsuarios').mockResolvedValue(usuariosMock)
    vi.spyOn(apiAdmin, 'obtenerAgencias').mockResolvedValue(agenciasMock)
    vi.spyOn(apiAdmin, 'obtenerTodasLasCompras').mockResolvedValue(comprasMock)
    vi.spyOn(apiAdmin, 'obtenerPaquetesDeInteres').mockResolvedValue(paquetesInteresMock)
    vi.spyOn(apiAdmin, 'obtenerPuntajesYObservaciones').mockResolvedValue(opinionesMock)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    })

    const botonCompras = screen.getByRole('button', { name: /Compras/i })
    await userEvent.click(botonCompras)

    expect(screen.getByText('Compras Realizadas (1)')).toBeInTheDocument()
    expect(screen.getByText('Semana en Cancún')).toBeInTheDocument()
    expect(screen.getByText('$2000')).toBeInTheDocument()
  })

  it('permite cambiar a la pestaña de Paquetes de Interés', async () => {
    vi.spyOn(apiAdmin, 'obtenerReportes').mockResolvedValue(reportesMock)
    vi.spyOn(apiAdmin, 'obtenerUsuarios').mockResolvedValue(usuariosMock)
    vi.spyOn(apiAdmin, 'obtenerAgencias').mockResolvedValue(agenciasMock)
    vi.spyOn(apiAdmin, 'obtenerTodasLasCompras').mockResolvedValue(comprasMock)
    vi.spyOn(apiAdmin, 'obtenerPaquetesDeInteres').mockResolvedValue(paquetesInteresMock)
    vi.spyOn(apiAdmin, 'obtenerPuntajesYObservaciones').mockResolvedValue(opinionesMock)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    })

    const botonInteres = screen.getByRole('button', { name: /Paquetes de Interés/i })
    await userEvent.click(botonInteres)

    expect(screen.getByText('Paquetes de Interés Guardados (1)')).toBeInTheDocument()
    expect(screen.getByText('Semana en Cancún')).toBeInTheDocument()
  })

  it('permite cambiar a la pestaña de Puntajes y Observaciones', async () => {
    vi.spyOn(apiAdmin, 'obtenerReportes').mockResolvedValue(reportesMock)
    vi.spyOn(apiAdmin, 'obtenerUsuarios').mockResolvedValue(usuariosMock)
    vi.spyOn(apiAdmin, 'obtenerAgencias').mockResolvedValue(agenciasMock)
    vi.spyOn(apiAdmin, 'obtenerTodasLasCompras').mockResolvedValue(comprasMock)
    vi.spyOn(apiAdmin, 'obtenerPaquetesDeInteres').mockResolvedValue(paquetesInteresMock)
    vi.spyOn(apiAdmin, 'obtenerPuntajesYObservaciones').mockResolvedValue(opinionesMock)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
    })

    const botonOpiniones = screen.getByRole('button', { name: /Puntajes y Observaciones/i })
    await userEvent.click(botonOpiniones)

    expect(screen.getAllByText('Puntajes y Observaciones (1)').length).toBe(2)
    expect(screen.getByText('"Increíble viaje"')).toBeInTheDocument()
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
  })
})
