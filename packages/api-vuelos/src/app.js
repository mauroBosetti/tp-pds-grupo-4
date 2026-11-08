import express, {json} from "express";
import cors from "cors";
import {setParams} from './utils.js'
import {registrarVenta, VentaError} from "./ventas.js";

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

    /**
     * POST /api/venta
     * Body: { "ids_vuelo": [idVuelo1, idVuelo2], "pasajero": "Nombre" }
     * 200 -> venta registrada (ambos vuelos descontados)
     * 400 -> pedido inválido | 404 -> vuelo inexistente | 409 -> vuelo sin disponibilidad
     */
    app.post("/api/venta", async (req, res) => {
        const {ids_vuelo, pasajero} = req.body ?? {};

        try {
            const venta = await registrarVenta(pool, ids_vuelo, pasajero);
            res.json(venta);
        } catch (err) {
            if (err instanceof VentaError) {
                return res.status(err.status).json({error: err.message});
            }
            console.error(err);
            res.status(500).json({error: "Error registrando la venta"});
        }
    });

    return app;
}