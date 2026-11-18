import express, {json} from "express";
import cors from "cors";
import {setParams} from './utils.js'
import {registrarVenta, VentaError} from "./ventas.js";
import {logger} from './logging/logger.js'
import {contextoDePeticion, registrarPeticiones, manejarErrores} from './logging/middlewares.js'

const MOTIVOS_DE_RECHAZO = {
    400: "PedidoInvalido",
    404: "VueloInexistente",
    409: "VueloSinDisponibilidad",
};

/**
 * Crea la app de Express recibiendo el pool por parámetro (inyección de dependencia).
 * Esto permite testear la app con un pool apuntando a una DB de test,
 * sin tocar server.js ni bindear un puerto real.
 */
export function createApp(pool) {
    const app = express();

    app.use(contextoDePeticion);
    app.use(registrarPeticiones);
    app.use(cors());
    app.use(json());

    app.get("/health", (_req, res) => {
        res.json({estado: "ok"});
    });

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
            logger.error({err}, "error_consultando_vuelos");
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
            logger.info({idVenta: venta.id_venta, idsVuelo: venta.ids_vuelo}, "venta_registrada");
            res.json(venta);
        } catch (err) {
            if (err instanceof VentaError) {
                logger.warn(
                    {
                        status: err.status,
                        motivo: MOTIVOS_DE_RECHAZO[err.status] ?? "Desconocido",
                        detalle: err.message,
                    }, 
                    "venta_rechazada"
                );
                return res.status(err.status).json({error: err.message});
            }
            logger.error({err}, "error_registrando_venta");
            res.status(500).json({error: "Error registrando la venta"});
        }
    });

    app.use(manejarErrores);
    return app;
}