import express from 'express'
import cors from 'cors'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())

app.get('/hola', (_req, res) => {
  res.send('Hola')
})

app.listen(port, () => {
  console.log(`ctv-backend listening on port ${port}`)
})
