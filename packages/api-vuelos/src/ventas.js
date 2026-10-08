export const VUELOS_POR_VENTA = 2;
const MAX_INT4 = 2_147_483_647;

export class VentaError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "VentaError";
        this.status = status;
    }
}

const esIdValido = (id) => Number.isInteger(id) && id > 0 && id <= MAX_INT4;

function validarPedido(idsVuelo, pasajero) {
    if (
        !Array.isArray(idsVuelo) ||
        idsVuelo.length !== VUELOS_POR_VENTA ||
        !idsVuelo.every(esIdValido)
    ) {
        throw new VentaError(400, `ids_vuelo debe ser un arreglo de exactamente ${VUELOS_POR_VENTA} ids enteros`);
    }
    if (new Set(idsVuelo).size !== idsVuelo.length) {
        throw new VentaError(400, "Los vuelos de una venta deben ser distintos");
    }
    if (typeof pasajero !== "string" || pasajero.trim() === "") {
        throw new VentaError(400, "El pasajero es obligatorio");
    }
}

/**
 * Registra una venta de 2 vuelos para un pasajero.
 *
 * @param pool      
 * @param idsVuelo  [id_vuelo, id_vuelo]
 * @param pasajero  
 * @returns {{id_venta, pasajero, ids_vuelo}}
 */
export async function registrarVenta(pool, idsVuelo, pasajero) {
    validarPedido(idsVuelo, pasajero);
    pasajero = pasajero.trim();

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const {rows: vuelos} = await client.query(
            `SELECT id_vuelo, disponibilidad
               FROM vuelos
              WHERE id_vuelo = ANY($1::int[])
              ORDER BY id_vuelo
                FOR UPDATE`,
            [idsVuelo]
        );

        if (vuelos.length !== idsVuelo.length) {
            const existentes = new Set(vuelos.map((v) => v.id_vuelo));
            const faltante = idsVuelo.find((id) => !existentes.has(id));
            throw new VentaError(404, `El vuelo ${faltante} no existe`);
        }
        const agotado = vuelos.find((v) => v.disponibilidad < 1);
        if (agotado) {
            throw new VentaError(409, `El vuelo ${agotado.id_vuelo} no tiene disponibilidad`);
        }

        await client.query(
            `UPDATE vuelos
                SET disponibilidad = disponibilidad - 1
              WHERE id_vuelo = ANY($1::int[])`,
            [idsVuelo]
        );

        const {rows: [venta]} = await client.query(
            `INSERT INTO ventas (nombre_pasajero, fecha_compra)
             VALUES ($1, NOW())
             RETURNING id_venta`,
            [pasajero]
        );

        await client.query(
            `INSERT INTO venta_vuelos (id_venta, id_vuelo)
             SELECT $1::int, UNNEST($2::int[])`,
            [venta.id_venta, idsVuelo]
        );

        await client.query("COMMIT");

        return {id_venta: venta.id_venta, pasajero, ids_vuelo: idsVuelo};
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}
