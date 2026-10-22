import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PuntajePromedio from './PuntajePromedio'

describe('PuntajePromedio', () => {
  it('muestra el promedio con un decimal y la cantidad de opiniones', () => {
    render(<PuntajePromedio puntajePromedio={4} cantidadDePuntajes={3} />)

    expect(screen.getByText('4.0')).toBeInTheDocument()
    expect(screen.getByText('(3 opiniones)')).toBeInTheDocument()
  })

  it('usa el singular con una sola opinión', () => {
    render(<PuntajePromedio puntajePromedio={5} cantidadDePuntajes={1} />)

    expect(screen.getByText('(1 opinión)')).toBeInTheDocument()
  })

  it('avisa cuando todavía no hay opiniones', () => {
    render(<PuntajePromedio puntajePromedio={null} cantidadDePuntajes={0} />)

    expect(screen.getByText('Sin opiniones todavía')).toBeInTheDocument()
  })
})
