export function setParams(query, params, fecha, destino, origen) {
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