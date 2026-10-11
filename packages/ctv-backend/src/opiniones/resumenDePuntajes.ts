export interface ResumenDePuntajes {
  puntajePromedio: number | null
  cantidadDePuntajes: number
}

export function resumirPuntajes(puntajes: number[]): ResumenDePuntajes {
  if (puntajes.length === 0) {
    return { puntajePromedio: null, cantidadDePuntajes: 0 }
  }
  const suma = puntajes.reduce((acumulado, puntaje) => acumulado + puntaje, 0)
  return {
    puntajePromedio: Math.round((suma / puntajes.length) * 10) / 10,
    cantidadDePuntajes: puntajes.length,
  }
}
