import {Given, When, Then} from "@cucumber/cucumber";
import assert from "node:assert/strict";
import request from "supertest";
import {app, pool} from "./hooks.js";

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
        const id_vuelo = result.rows[0].id_vuelo;
        this.vuelosByDestino[destino] = id_vuelo;
        this.lastVueloId = id_vuelo; // "ese vuelo" = el último creado
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

When("compro un pasaje para {string} en ese vuelo", async function (pasajero) {
    this.response = await request(app)
        .post("/api/venta")
        .send({id_vuelo: this.lastVueloId, pasajero});
});

Then("la venta debe ser exitosa", function () {
    assert.equal(this.response.status, 200, `Status esperado 200, recibido ${this.response.status}`);
    assert.ok(this.response.body.id_vuelo, "La respuesta no tiene id_vuelo");
});

Then("la venta debe fallar con error {string}", function (mensajeEsperado) {
    assert.equal(this.response.status, 400);
    assert.equal(this.response.body.error, mensajeEsperado);
});

Then("la disponibilidad del vuelo debe ser {int}", async function (disponibilidadEsperada) {
    const result = await pool.query(
        "SELECT disponibilidad FROM vuelos WHERE id_vuelo = $1",
        [this.lastVueloId]
    );
    assert.equal(result.rows[0].disponibilidad, disponibilidadEsperada);
});