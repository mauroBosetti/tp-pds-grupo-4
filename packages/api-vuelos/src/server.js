import {Pool} from "pg";
import {createApp} from "./app.js";

const port = Number(process.env.PORT) || 4001;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/db_vuelos"; // TODO sacar a un .env.dev

process.env.PORT || console.warn("Puerto no especificado");
process.env.DATABASE_URL || console.warn("DATABASE_URL no especificada");

const pool = new Pool({connectionString});
const app = createApp(pool);

app.listen(port, () => {
    console.log(`API-vuelos listening on port ${port}`);
});