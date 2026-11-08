import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DetallePaquete from './DetallePaquete'
import { AuthUsuarioProvider } from '@/auth/AuthUsuarioContext'
import * as apiPaquetes from '@/api/paquetes'
import { SinAutorizacion, type DetalleDePaquete } from '@/api/paquetes'

function renderizar() {
  return render(
    <AuthUsuarioProvider>
      <MemoryRouter initialEntries={['/paquetes/p-1']}>
        <Routes>
          <Route path="/paquetes/:id" element={<DetallePaquete />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthUsuarioProvider>,
  )
}

const paquete: DetalleDePaquete = {
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
  comentarios: [{ autor: 'Clara', puntaje: 5, comentario: 'Genial' }],
}

describe('DetallePaquete', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra el paquete, su promedio y los comentarios', async () => {
    const obtener = vi.spyOn(apiPaquetes, 'obtenerDetalleDePaquete').mockResolvedValue(paquete)

    renderizar()

    expect(await screen.findByText('Escapada a Madrid')).toBeInTheDocument()
    expect(obtener).toHaveBeenCalledWith('p-1')
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('Clara')).toBeInTheDocument()
    expect(screen.getByText('Genial')).toBeInTheDocument()
  })

  it('avisa cuando el paquete todavía no tiene comentarios', async () => {
    vi.spyOn(apiPaquetes, 'obtenerDetalleDePaquete').mockResolvedValue({
      ...paquete,
      comentarios: [],
    })

    renderizar()

    expect(await screen.findByText(/todavía no hay comentarios/i)).toBeInTheDocument()
  })

  it('muestra un error cuando falla la carga', async () => {
    vi.spyOn(apiPaquetes, 'obtenerDetalleDePaquete').mockRejectedValue(new Error('falló'))

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el paquete.')
  })

  it('redirige al login cuando la sesión expiró', async () => {
    vi.spyOn(apiPaquetes, 'obtenerDetalleDePaquete').mockRejectedValue(new SinAutorizacion('vencido'))

    renderizar()

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
  })
})
