import express, {json} from "express";
import cors from "cors";
import {setParams} from './utils.js'

/**
 * Crea la app de Express recibiendo el pool por parámetro (inyección de dependencia).
 * Esto permite testear la app con un pool apuntando a una DB de test,
 * sin tocar server.js ni bindear un puerto real.
 */
export function createApp(pool) {
    const app = express();

    app.use(cors());
    app.use(json());

    app.get("/api/vuelos", async (req, res) => {
        try {
            const {fecha, destino, origen} = req.query;

            const params = [];
            let query = "SELECT * FROM vuelos WHERE disponibilidad > 0";
            query = setParams(query, params, fecha, destino, origen);

            const result = await pool.query(query, params);

            const vuelos = result.rows.map((v) => ({
                ...v,
                fecha: v.fecha.toISOString().split("T")[0],
                hora: v.fecha.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                    second: "2-digit",
                }),
            }));

            res.json(vuelos);
        } catch (err) {
            console.error(err);
            res.status(500).json({error: "Error consultando vuelos"});
        }
    });

    app.post("/api/venta", async (req, res) => {
        const {id_vuelo, pasajero} = req.body;

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const result = await client.query(
                `UPDATE vuelos
                 SET disponibilidad = disponibilidad - 1
                 WHERE id_vuelo = $1
                   AND disponibilidad > 0 RETURNING *`,
                [id_vuelo]
            );

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");
                return res.status(400).json({error: "Vuelo sin disponibilidad o inexistente"});
            }

            await client.query(
                `INSERT INTO ventas (id_vuelo, nombre_pasajero, fecha_compra)
                 VALUES ($1, $2, NOW())`,
                [id_vuelo, pasajero]
            );

            await client.query("COMMIT");

            res.json({id_vuelo, pasajero});
        } catch (err) {
            await client.query("ROLLBACK");
            console.error(err);
            res.status(500).json({error: "Error registrando la venta"});
        } finally {
            client.release();
        }
    });

    return app;
}