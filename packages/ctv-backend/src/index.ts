import express from 'express'
import cors from 'cors'
import { agenciasRutas } from './agencias/agenciasRutas.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

app.get('/hola', (_req, res) => {
  res.send('Hola')
})

app.use(agenciasRutas)

app.listen(port, () => {
  console.log(`ctv-backend listening on port ${port}`)
})
