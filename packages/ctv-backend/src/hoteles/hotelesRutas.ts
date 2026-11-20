import { Router } from 'express'
import { registrarHotel, obtenerHotel, listarHoteles, DatosDeHotelInvalidos } from '../hoteles/hotelesServicio.js'
import { requiereAdministrador } from '../auth/requiereAdministrador.js'
import { requiereUsuario } from '../auth/requiereUsuario.js'

const hotelesRouter: Router = Router()

hotelesRouter.get('/', requiereUsuario, async (_req, res) => {
  const hoteles = await listarHoteles()
  res.json(hoteles)
})

hotelesRouter.post('/', requiereAdministrador, async (req, res) => {
  try {
    const hotel = await registrarHotel(req.body)
    res.status(201).json(hotel)
  } catch (error) {
    if (error instanceof DatosDeHotelInvalidos) {
      res.status(400).json({ error: error.message })
      return
    }
    throw error
  }
})

hotelesRouter.get('/:id', async (req, res) => {
  const hotel = await obtenerHotel(req.params.id)
  if (!hotel) {
    res.status(404).json({ error: 'Hotel no encontrado' })
    return
  }
  res.json(hotel)
})

export { hotelesRouter }
