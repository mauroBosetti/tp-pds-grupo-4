// Sobreventa directa contra api-vuelos (POST /api/venta), sin pasar por el backend.
// Alterna el orden [ida, vuelta] / [vuelta, ida] para provocar un posible deadlock.
import { pedir } from './lib/http.js';
import { VUELOS_URL, VUELOS_SOBREVENTA } from './lib/config.js';
import { opcionesSobreventa, clasificar, verificarSeedFresco, verificarConsistencia } from './lib/sobreventa.js';

export const options = opcionesSobreventa();

export function setup() {
  verificarSeedFresco();
}

export default function () {
  const { ida, vuelta } = VUELOS_SOBREVENTA;
  const ids = (__VU + __ITER) % 2 === 0 ? [ida, vuelta] : [vuelta, ida];
  const res = pedir('POST', `${VUELOS_URL}/api/venta`, {
    nombre: 'venta-directa',
    estadosEsperados: [200, 409],
    cuerpo: { pasajero: `K6 Pasajero ${__VU}-${__ITER}`, ids_vuelo: ids },
  });
  clasificar(res, 200);
}

export function teardown() {
  verificarConsistencia();
}
