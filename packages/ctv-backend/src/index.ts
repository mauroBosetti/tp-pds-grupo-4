import express from 'express'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { agencyRouter } from './routes/agency.js'
import { authRouter } from './routes/auth.js'
import { packageRouter } from './routes/package.js'
import { reportRouter } from './routes/report.js'
import { reviewRouter } from './routes/review.js'
import { userRouter } from './routes/user.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())

const swaggerDocument = YAML.load('./resources/swagger.yaml')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/agencias', agencyRouter)
app.use('/api/auth', authRouter)
app.use('/api/package', packageRouter)
app.use('/api/report', reportRouter)
app.use('/api/review', reviewRouter)
app.use('/api/user', userRouter)

app.get('/hola', (_req, res) => {
  res.send('Hola')
})

app.listen(port, () => {
  console.log(`ctv-backend listening on port ${port}`)
})
