import express from 'express'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())

const swaggerDocument = YAML.load('./resources/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get('/hola', (_req, res) => {
  res.send('Hola')
})

app.listen(port, () => {
  console.log(`ctv-backend listening on port ${port}`)
})
