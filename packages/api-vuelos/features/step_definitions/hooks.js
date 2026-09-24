import { Before, After, BeforeAll, AfterAll } from "@cucumber/cucumber";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createApp } from "../../src/app.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Usá una DB separada para tests, nunca la de dev/prod.
const connectionString =
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres:root@localhost:5432/db_vuelos_test";

export const pool = new Pool({ connectionString });
export const app = createApp(pool);

BeforeAll(async function () {
    // Única fuente de verdad del esquema: db/schema.sql (el mismo que usa la app real).
    const schema = readFileSync(join(__dirname, "../../src/db/script.sql"), "utf-8");
    await pool.query(schema);
});

Before(async function () {
    // Limpia el estado entre escenarios para que no se pisen entre sí.
    await pool.query("TRUNCATE ventas, vuelos RESTART IDENTITY CASCADE");
    this.vuelosByDestino = {};
    this.lastVueloId = null;
    this.response = null;
});

After(async function () {
    // noop por ahora; queda el hook por si se necesita limpieza extra por escenario
});

AfterAll(async function () {
    await pool.end();
});