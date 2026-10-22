import { describe, expect, it } from 'vitest'
import { resumirPuntajes } from './resumenDePuntajes'

describe('resumirPuntajes', () => {
  it('no tiene promedio cuando no hay puntajes', () => {
    expect(resumirPuntajes([])).toEqual({ puntajePromedio: null, cantidadDePuntajes: 0 })
  })

  it('promedia los puntajes redondeando a un decimal', () => {
    expect(resumirPuntajes([5, 4, 4])).toEqual({ puntajePromedio: 4.3, cantidadDePuntajes: 3 })
  })
})
