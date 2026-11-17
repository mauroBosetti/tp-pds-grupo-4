import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import YAML from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import {agencyRouter} from "./agencias/agenciasRutas.js";
import {authRouter} from "./auth/authRutas.js";
import {comprasRouter} from "./compras/comprasRutas.js";
import {packageRouter} from "./paquetes/paquetesRutas.js";
import {reportRouter} from "./reportes/reportesRutas.js";
import {opinionesRouter} from "./opiniones/opinionesRutas.js";
import {userRouter} from "./usuarios/usuariosRutas.js";
import {logger} from "./logging/logger.js";
import { contextoDePeticion, registrarPeticiones, manejarErrores } from './logging/middleware.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(contextoDePeticion)
app.use(registrarPeticiones)
app.use(cors())
app.use(express.json())

const swaggerDocument = YAML.load('./resources/swagger.yaml')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/agencias', agencyRouter)
app.use('/api/auth', authRouter)
app.use('/api/compras', comprasRouter)
app.use('/api/package', packageRouter)
app.use('/api/report', reportRouter)
app.use('/api/review', opinionesRouter)
app.use('/api/user', userRouter)

app.get('/hola', (_req, res) => {
  res.send('Hola')
})

app.use(manejarErrores)

process.on('unhandledRejection', (razon) => {
  logger.fatal({ err: razon }, 'promesa_rechazada_sin_manejar')
  process.exit(1)
})
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'excepcion_sin_capturar')
  process.exit(1)
})

app.listen(port, () => {
  logger.info({ puerto: port }, 'servidor_iniciado')
})
