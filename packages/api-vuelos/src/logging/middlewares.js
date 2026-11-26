import {randomUUID} from "node:crypto";
import {ejecutarConContexto, obtenerRequestId} from "./contexto.js";
import {logger} from "./logger.js";

const ENCABEZADO_REQUEST_ID = "x-request-id";
const FORMATO_REQUEST_ID = /^[\w.-]{1,100}$/;

export function contextoDePeticion(req, res, next) {
    const entrante = req.headers[ENCABEZADO_REQUEST_ID];
    const requestId = typeof entrante === "string" && FORMATO_REQUEST_ID.test(entrante)
        ? entrante
        : randomUUID();
    res.setHeader(ENCABEZADO_REQUEST_ID, requestId);
    ejecutarConContexto({requestId}, next);
}

const nivelSegunEstado = (estado) => (estado >= 500 ? "error" : estado >= 400 ? "warn" : "info");
const rutaDe = (req) => (req.route ? `${req.baseUrl}${req.route.path}` : "sin_ruta");

export function registrarPeticiones(req, res, next) {
    const inicio = process.hrtime.bigint();
    const requestId = obtenerRequestId();
    res.on("finish", () => {
        const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
        const registrar = () =>
            logger[nivelSegunEstado(res.statusCode)](
                {
                    metodo: req.method,
                    ruta: rutaDe(req),
                    status: res.statusCode,
                    duracionMs: Math.round(duracionMs * 10) / 10,
                },
                "peticion_finalizada"
            );
        requestId ? ejecutarConContexto({requestId}, registrar) : registrar();
    });
    next();
}

const estadoDelError = (error) =>
    Number.isInteger(error?.status) && error.status >= 400 && error.status < 500 ? error.status : 500;

export function manejarErrores(error, _req, res, next) {
    if (res.headersSent) return next(error);
    const estado = estadoDelError(error);
    if (estado >= 500) {
        logger.error({err: error}, "error_no_controlado");
        return res.status(500).json({error: "Error interno del servidor"});
    }
    logger.warn({err: error}, "peticion_invalida");
    res.status(estado).json({error: "Petición inválida"});
}