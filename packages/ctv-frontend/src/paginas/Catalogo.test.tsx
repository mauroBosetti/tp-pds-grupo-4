import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
          <Route path="/paquetes/:id" element={<p>Detalle del paquete</p>} />
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
    puntajePromedio: 4.5,
    cantidadDePuntajes: 2,
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
    puntajePromedio: null,
    cantidadDePuntajes: 0,
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

  it('muestra el puntaje promedio de cada paquete', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockResolvedValue(paquetes)

    renderizar()

    expect(await screen.findByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(2 opiniones)')).toBeInTheDocument()
    expect(screen.getByText('Sin opiniones todavía')).toBeInTheDocument()
  })

  it('lleva al detalle del paquete con el botón Ver más', async () => {
    vi.spyOn(apiPaquetes, 'listarCatalogo').mockResolvedValue(paquetes)
    renderizar()
    await screen.findByText('Escapada a Madrid')
    const fila = screen.getByText('Escapada a Madrid').closest('li') as HTMLElement

    await userEvent.click(within(fila).getByRole('button', { name: 'Ver más' }))

    expect(await screen.findByText('Detalle del paquete')).toBeInTheDocument()
  })

  describe('al comprar un paquete', () => {
    async function renderizarConCatalogo() {
      vi.spyOn(apiPaquetes, 'listarCatalogo').mockResolvedValue(paquetes)
      renderizar()
      await screen.findByText('Escapada a Madrid')
    }

    function botonComprarDe(nombre: string) {
      const fila = screen.getByText(nombre).closest('li') as HTMLElement
      return within(fila).getByRole('button', { name: 'Comprar' })
    }

    it('compra el paquete elegido y confirma la compra', async () => {
      const comprar = vi
        .spyOn(apiPaquetes, 'comprarPaquete')
        .mockResolvedValue({ id_venta: 7, pasajero: 'Clara', ids_vuelo: [1, 2] })
      await renderizarConCatalogo()

      await userEvent.click(botonComprarDe('Verano en Bariloche'))

      expect(comprar).toHaveBeenCalledWith('p-2')
      expect(await screen.findByRole('status')).toHaveTextContent('Verano en Bariloche')
    })

    it('muestra el motivo cuando la compra es rechazada', async () => {
      vi.spyOn(apiPaquetes, 'comprarPaquete').mockRejectedValue(
        new Error('El vuelo 2 no tiene disponibilidad'),
      )
      await renderizarConCatalogo()

      await userEvent.click(botonComprarDe('Escapada a Madrid'))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'El vuelo 2 no tiene disponibilidad',
      )
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('redirige al login cuando la sesión expiró al comprar', async () => {
      vi.spyOn(apiPaquetes, 'comprarPaquete').mockRejectedValue(new SinAutorizacion('vencido'))
      await renderizarConCatalogo()

      await userEvent.click(botonComprarDe('Escapada a Madrid'))

      expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    })
  })
})
