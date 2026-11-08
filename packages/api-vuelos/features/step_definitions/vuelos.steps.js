import {Given, When, Then} from "@cucumber/cucumber";
import assert from "node:assert/strict";
import request from "supertest";
import {app, pool} from "./hooks.js";

const comprar = (idsVuelo, pasajero) =>
    request(app).post("/api/venta").send({ids_vuelo: idsVuelo, pasajero});

async function comprarEnParalelo(world, cantidad, destinoA, destinoB, alternar) {
    const idA = world.vuelosByDestino[destinoA];
    const idB = world.vuelosByDestino[destinoB];

    world.responses = await Promise.all(
        Array.from({length: cantidad}, (_, i) => {
            const ids = alternar && i % 2 === 1 ? [idB, idA] : [idA, idB];
            return comprar(ids, `Pasajero ${i + 1}`);
        })
    );
}

Given(
    "existe un vuelo de {string} a {string} con disponibilidad {int}",
    async function (origen, destino, disponibilidad) {
        // aerolinea, fecha y capacidad son NOT NULL en el esquema real pero el
        // feature no los especifica: uso valores por defecto razonables.
        // capacidad = disponibilidad para no dejar el vuelo en un estado inconsistente.
        const aerolinea = "Aerolinea Test";
        const fecha = "2027-01-01 10:00:00";
        const capacidad = disponibilidad;

        const result = await pool.query(
            `INSERT INTO vuelos (aerolinea, origen, destino, fecha, capacidad, disponibilidad)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_vuelo`,
            [aerolinea, origen, destino, fecha, capacidad, disponibilidad]
        );
        this.vuelosByDestino[destino] = result.rows[0].id_vuelo;
    }
);

When("consulto el listado de vuelos", async function () {
    this.response = await request(app).get("/api/vuelos");
});

Then("la respuesta no debe incluir el vuelo a {string}", function (destino) {
    const destinos = this.response.body.map((v) => v.destino);
    assert.ok(
        !destinos.includes(destino),
        `Se esperaba que la respuesta NO incluyera el vuelo a "${destino}", pero sí lo incluye`
    );
});

Then("la respuesta debe incluir el vuelo a {string}", function (destino) {
    const destinos = this.response.body.map((v) => v.destino);
    assert.ok(
        destinos.includes(destino),
        `Se esperaba que la respuesta incluyera el vuelo a "${destino}", pero no está`
    );
});

When(
    "compro un pasaje para {string} en los vuelos a {string} y a {string}",
    async function (pasajero, destinoA, destinoB) {
        this.response = await comprar(
            [this.vuelosByDestino[destinoA], this.vuelosByDestino[destinoB]],
            pasajero
        );
    }
);

When(
    "compro un pasaje para {string} en el vuelo a {string} y en un vuelo inexistente",
    async function (pasajero, destino) {
        this.response = await comprar([this.vuelosByDestino[destino], 999999], pasajero);
    }
);

When(
    "compro un pasaje para {string} dos veces en el vuelo a {string}",
    async function (pasajero, destino) {
        const id = this.vuelosByDestino[destino];
        this.response = await comprar([id, id], pasajero);
    }
);

When(
    "{int} pasajeros compran a la vez los vuelos a {string} y a {string}",
    async function (cantidad, destinoA, destinoB) {
        await comprarEnParalelo(this, cantidad, destinoA, destinoB, false);
    }
);

When(
    "{int} pasajeros compran a la vez los vuelos a {string} y a {string}, alternando el orden de los vuelos",
    async function (cantidad, destinoA, destinoB) {
        await comprarEnParalelo(this, cantidad, destinoA, destinoB, true);
    }
);

Then("la venta debe ser exitosa", function () {
    assert.equal(this.response.status, 200, `Status esperado 200, recibido ${this.response.status}`);
    assert.ok(this.response.body.id_venta, "La respuesta no tiene id_venta");
});

Then("la venta debe fallar con estado {int}", function (estadoEsperado) {
    assert.equal(this.response.status, estadoEsperado);
    assert.ok(this.response.body.error, "La respuesta no tiene mensaje de error");
});

Then("todas las ventas deben ser exitosas", function () {
    const fallidas = this.responses.filter((r) => r.status !== 200);
    assert.equal(
        fallidas.length,
        0,
        `Fallaron ${fallidas.length} ventas: ${JSON.stringify(fallidas.map((r) => [r.status, r.body]))}`
    );
});

Then("exactamente {int} venta debe ser exitosa", function (esperadas) {
    const exitosas = this.responses.filter((r) => r.status === 200);
    assert.equal(exitosas.length, esperadas);

    // Las que no entraron deben ser rechazos de negocio (409), nunca errores del servidor (500).
    for (const r of this.responses.filter((r) => r.status !== 200)) {
        assert.equal(r.status, 409, `Se esperaba 409 y llegó ${r.status}: ${JSON.stringify(r.body)}`);
    }
});

Then("la disponibilidad del vuelo a {string} debe ser {int}", async function (destino, esperada) {
    const result = await pool.query(
        "SELECT disponibilidad FROM vuelos WHERE id_vuelo = $1",
        [this.vuelosByDestino[destino]]
    );
    assert.equal(result.rows[0].disponibilidad, esperada);
});

Then("deben existir {int} ventas registradas", async function (esperadas) {
    const ventas = await pool.query("SELECT COUNT(*)::int AS n FROM ventas");
    const detalle = await pool.query("SELECT COUNT(*)::int AS n FROM venta_vuelos");
    assert.equal(ventas.rows[0].n, esperadas);
    // Cada venta debe tener exactamente sus 2 vuelos asociados.
    assert.equal(detalle.rows[0].n, esperadas * 2);
});
