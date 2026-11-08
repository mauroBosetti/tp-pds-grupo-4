import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MisCompras from './MisCompras'
import { AuthUsuarioProvider } from '@/auth/AuthUsuarioContext'
import * as apiCompras from '@/api/compras'
import * as apiOpiniones from '@/api/opiniones'
import { SinAutorizacion } from '@/api/paquetes'

function renderizar() {
  return render(
    <AuthUsuarioProvider>
      <MemoryRouter initialEntries={['/compras']}>
        <Routes>
          <Route path="/compras" element={<MisCompras />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthUsuarioProvider>,
  )
}

const compra: apiCompras.Compra = {
  id: 'c-1',
  fecha: '2026-10-11T06:43:06.212Z',
  opinion: null,
  paquete: {
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
}

describe('MisCompras', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra los paquetes comprados con su agencia y precio', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([compra])

    renderizar()

    expect(await screen.findByText('Escapada a Madrid')).toBeInTheDocument()
    expect(screen.getByText('Turismo Sur')).toBeInTheDocument()
    expect(screen.getByText('$1500')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando todavía no hay compras', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([])

    renderizar()

    expect(await screen.findByText(/todavía no compraste/i)).toBeInTheDocument()
  })

  it('muestra un error cuando falla la carga', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockRejectedValue(new Error('falló'))

    renderizar()

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar tus compras.')
  })

  it('redirige al login cuando la carga responde 401', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockRejectedValue(new SinAutorizacion('vencido'))

    renderizar()

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
  })

  it('muestra la opinión ya guardada de una compra', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([
      { ...compra, opinion: { puntaje: 4, comentario: 'Muy lindo' } },
    ])

    renderizar()

    expect(await screen.findByDisplayValue('Muy lindo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4 estrellas' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('guarda el puntaje y el comentario del paquete comprado', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([compra])
    const guardar = vi
      .spyOn(apiOpiniones, 'guardarOpinion')
      .mockResolvedValue({ puntaje: 5, comentario: 'Genial' })
    renderizar()
    await screen.findByText('Escapada a Madrid')

    await userEvent.click(screen.getByRole('button', { name: '5 estrellas' }))
    await userEvent.type(screen.getByLabelText('Comentario'), 'Genial')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar opinión' }))

    expect(guardar).toHaveBeenCalledWith('p-1', { puntaje: 5, comentario: 'Genial' })
    expect(await screen.findByRole('status')).toHaveTextContent('Opinión guardada')
  })

  it('no permite guardar una opinión vacía', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([compra])
    renderizar()
    await screen.findByText('Escapada a Madrid')

    expect(screen.getByRole('button', { name: 'Guardar opinión' })).toBeDisabled()
  })

  it('muestra el motivo cuando no se pudo guardar la opinión', async () => {
    vi.spyOn(apiCompras, 'listarMisCompras').mockResolvedValue([compra])
    vi.spyOn(apiOpiniones, 'guardarOpinion').mockRejectedValue(new Error('Opinión inválida'))
    renderizar()
    await screen.findByText('Escapada a Madrid')

    await userEvent.click(screen.getByRole('button', { name: '3 estrellas' }))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar opinión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Opinión inválida')
  })
})
