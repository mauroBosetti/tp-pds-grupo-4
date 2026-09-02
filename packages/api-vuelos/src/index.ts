import express from "express";
import cors from "cors";

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())

app.get('/api/vuelos', (req, res) => {
  // TODO
  res.json({})
})
app.post('/api/venta', (req, res) => {
  // TODO
  res.json({})
})

app.listen(port, () => {
  console.log(`API-vuelos listening on port ${port}`)
})