import {Pool} from "pg";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const destinos = {
    dev: process.env.DATABASE_URL || "postgresql://vuelos:vuelos@localhost:5433/vuelos",
    test: process.env.TEST_DATABASE_URL || "postgresql://vuelos_test:vuelos_test@localhost:5434/vuelos_test",
};

const destino = process.argv[2] ?? "dev";
if (!destinos[destino]) {
    console.error(`Destino desconocido "${destino}". Usá: ${Object.keys(destinos).join(" | ")}`);
    process.exit(1);
}

const {hostname, port, pathname} = new URL(destinos[destino]);
console.log(`Reseteando "${destino}": ${hostname}:${port}${pathname}`);

const pool = new Pool({connectionString: destinos[destino]});
try {
    await pool.query("DROP TABLE IF EXISTS venta_vuelos, ventas, vuelos CASCADE");
    const schema = readFileSync(join(__dirname, "../src/db/script.sql"), "utf-8");
    await pool.query(schema);
    console.log("Listo: tablas recreadas.");
} catch (err) {
    console.error("Error reseteando la base:", err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}