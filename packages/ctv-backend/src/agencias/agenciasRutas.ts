import { Router } from 'express'
import { registrarAgencia, obtenerAgencia, NombreDeAgenciaInvalido } from './agenciasServicio.js'

export const agenciasRutas = Router()

agenciasRutas.post('/agencias', async (req, res) => {
  try {
    const agencia = await registrarAgencia(req.body?.nombre)
    res.status(201).json(agencia)
  } catch (error) {
    if (error instanceof NombreDeAgenciaInvalido) {
      res.status(400).json({ error: error.message })
      return
    }
    throw error
  }
})

agenciasRutas.get('/agencias/:id', async (req, res) => {
  const agencia = await obtenerAgencia(req.params.id)
  if (!agencia) {
    res.status(404).json({ error: 'Agencia no encontrada' })
    return
  }
  res.json(agencia)
})
