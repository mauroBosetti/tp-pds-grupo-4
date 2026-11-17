import pino from "pino";
import {obtenerRequestId} from "./contexto.js";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: {servicio: "api-vuelos"},
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {level: (label) => ({level: label})},
    mixin() {
        const requestId = obtenerRequestId();
        return requestId ? {requestId} : {};
    },
});