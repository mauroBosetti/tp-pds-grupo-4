import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthAdministradorProvider } from './AuthAdministradorContext'
import RutaAdministrador from './RutaAdministrador'
import { guardarTokenAdministrador } from './tokenAdministrador'

function renderizarEn(rutaInicial: string) {
  return render(
    <AuthAdministradorProvider>
      <MemoryRouter initialEntries={[rutaInicial]}>
        <Routes>
          <Route path="/admin/login" element={<p>Pantalla de login</p>} />
          <Route element={<RutaAdministrador />}>
            <Route path="/admin" element={<p>Panel protegido</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthAdministradorProvider>,
  )
}

describe('RutaAdministrador', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('redirige al login cuando no hay sesión', () => {
    renderizarEn('/admin')

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Panel protegido')).not.toBeInTheDocument()
  })

  it('muestra el contenido protegido cuando hay token', () => {
    guardarTokenAdministrador('abc.123')

    renderizarEn('/admin')

    expect(screen.getByText('Panel protegido')).toBeInTheDocument()
  })
})
