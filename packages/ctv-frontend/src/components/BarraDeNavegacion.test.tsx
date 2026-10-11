import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import BarraDeNavegacion from './BarraDeNavegacion'
import { AuthUsuarioProvider } from '@/auth/AuthUsuarioContext'
import { guardarTokenUsuario, guardarUsuario, leerTokenUsuario } from '@/auth/tokenUsuario'

function renderizarConSesion(rol: 'cliente' | 'agencia' = 'cliente') {
  guardarTokenUsuario('abc.123')
  guardarUsuario({ nombre: 'Clara Cliente', email: 'clara@demo.com', rol })
  return render(
    <AuthUsuarioProvider>
      <MemoryRouter initialEntries={['/catalogo']}>
        <Routes>
          <Route path="/catalogo" element={<BarraDeNavegacion />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthUsuarioProvider>,
  )
}

describe('BarraDeNavegacion', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('muestra el nombre y el rol del usuario logueado', () => {
    renderizarConSesion()

    expect(screen.getByText('Clara Cliente')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
  })

  it('ofrece al cliente ir al catálogo y a sus compras', () => {
    renderizarConSesion('cliente')

    expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/catalogo')
    expect(screen.getByRole('link', { name: 'Mis compras' })).toHaveAttribute('href', '/compras')
  })

  it('no ofrece enlaces de cliente a una agencia', () => {
    renderizarConSesion('agencia')

    expect(screen.queryByRole('link', { name: 'Mis compras' })).not.toBeInTheDocument()
  })

  it('cierra la sesión y vuelve al login', async () => {
    renderizarConSesion()

    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(leerTokenUsuario()).toBeNull()
  })
})
