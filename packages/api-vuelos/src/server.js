import {Pool} from "pg";
import {createApp} from "./app.js";
import {logger} from "./logging/logger.js"

const port = Number(process.env.PORT) || 4001;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/db_vuelos"; // TODO sacar a un .env.dev

process.env.PORT || logger.warn("Puerto no especificado");
process.env.DATABASE_URL || logger.warn("DATABASE_URL no especificada");

process.on("unhandledRejection", (razon) => {
    logger.fatal({err: razon}, "promesa_rechazada_sin_manejar");
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    logger.fatal({err: error}, "excepcion_sin_capturar");
    process.exit(1);
});

const pool = new Pool({connectionString});
const app = createApp(pool);

app.listen(port, () => {
    logger.info({puerto: port}, "servidor_iniciado");
});