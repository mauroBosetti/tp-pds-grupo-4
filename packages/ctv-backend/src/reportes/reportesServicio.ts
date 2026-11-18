import {
  buscarTopCompradores,
  buscarTopDestinosRankeados,
  buscarTopAgenciasConMasVentas,
  buscarTopDestinosMasVendidos,
} from './reportesRepositorio.js'

export function obtenerTopCompradores() {
  return buscarTopCompradores()
}

export function obtenerTopDestinosRankeados() {
  return buscarTopDestinosRankeados()
}

export function obtenerTopAgenciasConMasVentas() {
  return buscarTopAgenciasConMasVentas()
}

export function obtenerTopDestinosMasVendidos() {
  return buscarTopDestinosMasVendidos()
}

export async function obtenerReporteCompleto() {
  const [topCompradores, topDestinosRankeados, topAgencias, topDestinosVendidos] =
    await Promise.all([
      buscarTopCompradores(),
      buscarTopDestinosRankeados(),
      buscarTopAgenciasConMasVentas(),
      buscarTopDestinosMasVendidos(),
    ])

  return {
    topCompradores,
    topDestinosRankeados,
    topAgencias,
    topDestinosVendidos,
  }
}
