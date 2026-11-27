import { cliente } from '../db/cliente.js'

export async function buscarTopCompradores() {
  const comprasPorUsuario = await cliente.compra.groupBy({
    by: ['usuarioClienteId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  })

  if (comprasPorUsuario.length === 0) {
    return []
  }

  const usuarios = await cliente.usuarioCliente.findMany({
    where: { id: { in: comprasPorUsuario.map((c) => c.usuarioClienteId) } },
    include: { cuenta: { select: { email: true } } },
  })

  return comprasPorUsuario.map((item) => {
    const usuario = usuarios.find((u) => u.id === item.usuarioClienteId)
    return {
      id: item.usuarioClienteId,
      nombre: usuario?.nombre ?? 'Desconocido',
      email: usuario?.cuenta.email ?? '',
      cantidadCompras: item._count.id,
    }
  })
}

export async function buscarTopDestinosRankeados() {
  const opinionesConPuntaje = await cliente.opinion.findMany({
    where: { puntaje: { not: null } },
    select: {
      puntaje: true,
      paquete: { select: { destino: true } },
    },
  })

  const porDestino = new Map<string, { suma: number; cantidad: number }>()
  for (const op of opinionesConPuntaje) {
    const destino = op.paquete.destino
    const actual = porDestino.get(destino) ?? { suma: 0, cantidad: 0 }
    porDestino.set(destino, {
      suma: actual.suma + (op.puntaje ?? 0),
      cantidad: actual.cantidad + 1,
    })
  }

  const ranking = Array.from(porDestino.entries()).map(([destino, { suma, cantidad }]) => ({
    destino,
    puntajePromedio: Number((suma / cantidad).toFixed(2)),
    cantidadOpiniones: cantidad,
  }))

  ranking.sort(
    (a, b) => b.puntajePromedio - a.puntajePromedio || b.cantidadOpiniones - a.cantidadOpiniones,
  )
  return ranking.slice(0, 5)
}

export async function buscarTopAgenciasConMasVentas() {
  const compras = await cliente.compra.findMany({
    select: {
      paquete: {
        select: {
          agencia: { select: { id: true, nombre: true } },
        },
      },
    },
  })

  const ventasPorAgencia = new Map<string, { nombre: string; cantidadVentas: number }>()
  for (const c of compras) {
    const agencia = c.paquete.agencia
    const actual = ventasPorAgencia.get(agencia.id) ?? { nombre: agencia.nombre, cantidadVentas: 0 }
    actual.cantidadVentas++
    ventasPorAgencia.set(agencia.id, actual)
  }

  const topAgencias = Array.from(ventasPorAgencia.entries()).map(
    ([id, { nombre, cantidadVentas }]) => ({
      id,
      nombre,
      cantidadVentas,
    }),
  )

  topAgencias.sort((a, b) => b.cantidadVentas - a.cantidadVentas)
  return topAgencias.slice(0, 5)
}

export async function buscarTopDestinosMasVendidos() {
  const compras = await cliente.compra.findMany({
    select: {
      paquete: { select: { destino: true } },
    },
  })

  const ventasPorDestino = new Map<string, number>()
  for (const c of compras) {
    const destino = c.paquete.destino
    ventasPorDestino.set(destino, (ventasPorDestino.get(destino) ?? 0) + 1)
  }

  const topDestinos = Array.from(ventasPorDestino.entries()).map(([destino, cantidadVentas]) => ({
    destino,
    cantidadVentas,
  }))

  topDestinos.sort((a, b) => b.cantidadVentas - a.cantidadVentas)
  return topDestinos.slice(0, 5)
}
