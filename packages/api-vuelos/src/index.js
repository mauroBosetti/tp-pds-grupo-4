import express, {json} from "express";
import cors from "cors";
import {Pool} from "pg";

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors())
app.use(json())

const pool = new Pool({connectionString: process.env.DATABASE_URL});

app.get("/api/vuelos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM vuelos WHERE disponibilidad > 0");

        const vuelos = result.rows.map((v) => ({
            ...v,
            fecha: v.fecha instanceof Date ? v.fecha.toISOString().split("T")[0] : v.fecha,
            hora: typeof v.hora === "string" && !v.hora.endsWith("Z") ? `${v.hora}Z` : v.hora,
        }));

        res.json(vuelos);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error consultando vuelos"});
    }
});

app.post("/api/venta", async (req, res) => {
    const {id_vuelo, pasajero} = req.body;

    try {
        const result = await pool.query(`UPDATE vuelos
                                         SET disponibilidad = disponibilidad - 1
                                         WHERE id_vuelo = $1
                                           AND disponibilidad > 0 RETURNING *`, [id_vuelo]);

        if (result.rowCount === 0) {
            return res.status(400).json({error: "Vuelo sin disponibilidad o inexistente"});
        }

        // TODO: registrar el nombre del pasajero en alguna tabla de ventas si hace falta

        res.json({id_vuelo, pasajero});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error registrando la venta"});
    }
});

app.listen(port, () => {
    console.log(`API-vuelos listening on port ${port}`)
})