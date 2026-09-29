import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Catalogo from './Catalogo'
import { AuthUsuarioProvider } from '@/auth/AuthUsuarioContext'
import * as apiPaquetes from '@/api/paquetes'
import { SinAutorizacion, type PaqueteDeCatalogo } from '@/api/paquetes'

function renderizar() {
  return render(
    <AuthUsuarioProvider>
      <MemoryRouter initialEntries={['/catalogo']}>
        <Routes>
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthUsuarioProvider>,
  )
}

const paquetes: PaqueteDeCatalogo[] = [
  {
    id: 'p-1',
    nombre: 'Escapada a Madrid',
    precio: 1500,
    origen: 'Buenos Aires',
    destino: 'Madrid',
    vueloIdaId: 1,
    vueloVueltaId: 2,
    agenciaId: 'ag-1',
    agencia: { id: 'ag-1', nombre: 'Turismo Sur' },
  },
  {
    id: 'p-2',
    nombre: 'Verano en Bariloche',
    precio: 900,
    origen: 'Buenos Aires',
    destino: 'Bariloche',
    vueloIdaId: 3,
    vueloVueltaId: 4,
    agenciaId: 'ag-2',
    agencia: { id: 'ag-2', nombre: 'Viajes del Norte' },
  },
]

describe('Catalogo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra los paquetes de todas las agencias', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockResolvedValue(paquetes)

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Escapada a Madrid')).toBeInTheDocument()
    })
    expect(screen.getByText('Verano en Bariloche')).toBeInTheDocument()
    expect(screen.getByText('Turismo Sur')).toBeInTheDocument()
    expect(screen.getByText('Viajes del Norte')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando todavía no hay paquetes', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockResolvedValue([])

    renderizar()

    await waitFor(() => {
      expect(screen.getByText(/todavía no hay paquetes/i)).toBeInTheDocument()
    })
  })

  it('muestra un error cuando falla la carga del catálogo', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockRejectedValue(new Error('falló'))

    renderizar()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el catálogo.')
    })
  })

  it('redirige al login cuando la carga responde 401', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockRejectedValue(new SinAutorizacion('vencido'))

    renderizar()

    await waitFor(() => {
      expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    })
  })
})
