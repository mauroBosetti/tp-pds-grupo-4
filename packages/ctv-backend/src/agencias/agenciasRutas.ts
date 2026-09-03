import { Router } from 'express'
import { registrarAgencia, obtenerAgencia, NombreDeAgenciaInvalido } from '../agencias/agenciasServicio.js'

const agencyRouter: Router = Router()

agencyRouter.post('/', async (req, res) => {
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

agencyRouter.get('/:id', async (req, res) => {
  const agencia = await obtenerAgencia(req.params.id)
  if (!agencia) {
    res.status(404).json({ error: 'Agencia no encontrada' })
    return
  }
  res.json(agencia)
})

export { agencyRouter }
