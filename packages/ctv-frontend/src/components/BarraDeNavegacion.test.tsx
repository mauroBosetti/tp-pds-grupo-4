import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import BarraDeNavegacion from './BarraDeNavegacion'
import { AuthUsuarioProvider } from '@/auth/AuthUsuarioContext'
import { guardarTokenUsuario, guardarUsuario, leerTokenUsuario } from '@/auth/tokenUsuario'

function renderizarConSesion() {
  guardarTokenUsuario('abc.123')
  guardarUsuario({ nombre: 'Clara Cliente', email: 'clara@demo.com', rol: 'cliente' })
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

  it('cierra la sesión y vuelve al login', async () => {
    renderizarConSesion()

    await userEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(leerTokenUsuario()).toBeNull()
  })
})
