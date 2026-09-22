import express, {json} from "express";
import cors from "cors";
import {Pool} from "pg";

const app = express()
const port = Number(process.env.PORT) || 4001
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/db_vuelos" // TODO sacar a un .env.dev
process.env.PORT || console.warn('Puerto no especificado')
process.env.DATABASE_URL || console.warn('DATABASE_URL no especificada')

app.use(cors())
app.use(json())

const pool = new Pool({connectionString});

function setParams(query, params, fecha, destino, origen) {
    if (fecha) {
        params.push(fecha);
        query += ` AND fecha::date = $${params.length}`;
    }

    if (destino) {
        params.push(destino);
        query += ` AND destino ILIKE $${params.length}`;
    }

    if (origen) {
        params.push(origen);
        query += ` AND origen ILIKE $${params.length}`;
    }
    return query;
}

app.get("/api/vuelos", async (req, res) => {
    try {
        const { fecha, destino, origen } = req.query;

        const params = [];
        let query = "SELECT * FROM vuelos WHERE disponibilidad > 0";
        query = setParams(query, params, fecha, destino, origen);

        const result = await pool.query(query, params);

        const vuelos = result.rows.map((v) => ({
            ...v,
            fecha: v.fecha.toISOString().split("T")[0],
            hora:  v.fecha.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", second: '2-digit' })
        }));

        res.json(vuelos);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error consultando vuelos"});
    }
});

app.post("/api/venta", async (req, res) => {
    const { id_vuelo, pasajero } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE vuelos
             SET disponibilidad = disponibilidad - 1
             WHERE id_vuelo = $1 AND disponibilidad > 0
                 RETURNING *`,
            [id_vuelo]
        );

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Vuelo sin disponibilidad o inexistente" });
        }

        await client.query(
            `INSERT INTO ventas (id_vuelo, nombre_pasajero, fecha_compra)
       VALUES ($1, $2, NOW())`,
            [id_vuelo, pasajero]
        );

        await client.query("COMMIT");

        res.json({ id_vuelo, pasajero });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Error registrando la venta" });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
    console.log(`API-vuelos listening on port ${port}`)
})