import { check, fail } from 'k6';
import { Counter } from 'k6/metrics';
import { vuelosDisponibles, exigirServiciosArriba } from './entorno.js';
import { RUTAS, CAPACIDAD_IDA_SOBREVENTA, CAPACIDAD_VUELTA_SOBREVENTA } from './config.js';

export const ventasExitosas = new Counter('ventas_exitosas');
export const ventasRechazadas = new Counter('ventas_rechazadas');
export const respuestasInesperadas = new Counter('respuestas_inesperadas');

// Cada intento debe terminar en éxito (estadoExito) o en 409 (sin cupo). Cualquier otro código es un error.
export function clasificar(res, estadoExito) {
  if (res.status === estadoExito) ventasExitosas.add(1);
  else if (res.status === 409) ventasRechazadas.add(1);
  else respuestasInesperadas.add(1);
  check(res, { 'respuesta esperada (exito o 409)': (r) => r.status === estadoExito || r.status === 409 });
}

export function opcionesSobreventa() {
  return {
    scenarios: {
      sobreventa: {
        executor: 'shared-iterations',
        vus: parseInt(__ENV.VUS || '50', 10),
        iterations: parseInt(__ENV.INTENTOS || '200', 10),
        maxDuration: '2m',
      },
    },
    thresholds: {
      // Exactamente la capacidad: ni una venta de más (sobreventa) ni de menos.
      ventas_exitosas: [`count==${CAPACIDAD_IDA_SOBREVENTA}`],
      respuestas_inesperadas: ['count==0'],
      checks: ['rate==1'],
    },
  };
}

// setup: el seed debe estar recién cargado (ida con todos sus asientos).
export function verificarSeedFresco() {
  exigirServiciosArriba();
  const ida = vuelosDisponibles(RUTAS.sobreventa.origen, RUTAS.sobreventa.destino);
  if (ida.length !== 1 || ida[0].disponibilidad !== CAPACIDAD_IDA_SOBREVENTA) {
    fail(`El vuelo de ida no está en su estado inicial (${CAPACIDAD_IDA_SOBREVENTA} asientos). Corré: bash seeds/seed.sh cargar`);
  }
}

// teardown: la base debe quedar consistente.
export function verificarConsistencia() {
  const ida = vuelosDisponibles(RUTAS.sobreventa.origen, RUTAS.sobreventa.destino);
  const vuelta = vuelosDisponibles(RUTAS.sobreventa.destino, RUTAS.sobreventa.origen);
  check(null, {
    'ida agotada (ya no se lista, disponibilidad 0)': () => ida.length === 0,
    [`vuelta con ${CAPACIDAD_VUELTA_SOBREVENTA - CAPACIDAD_IDA_SOBREVENTA} asientos (sin ventas parciales)`]: () =>
      vuelta.length === 1 && vuelta[0].disponibilidad === CAPACIDAD_VUELTA_SOBREVENTA - CAPACIDAD_IDA_SOBREVENTA,
  });
}
