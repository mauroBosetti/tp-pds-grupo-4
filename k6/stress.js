// Estrés: sube la carga por encima de lo normal hasta PICO usuarios, para ver dónde se degrada
// y si el sistema se recupera al bajar. No aborta: los umbrales solo marcan cuándo se cruzó el límite.
import { prepararClientes } from './lib/clientes.js';
import { exigirServiciosArriba, exigirSeedDeVuelos, exigirPaquete } from './lib/entorno.js';
import { RUTAS, PAQUETES, CANTIDAD_CLIENTES } from './lib/config.js';
import { sesionDeUsuario } from './lib/flujos.js';

const PICO = parseInt(__ENV.PICO || '200', 10);
const pct = (p) => Math.max(1, Math.round((PICO * p) / 100));

export const options = {
  stages: [
    { duration: '1m', target: pct(10) },
    { duration: '1m', target: pct(50) },
    { duration: '1m', target: PICO },
    { duration: '2m', target: PICO },       // sostener el pico
    { duration: '1m', target: pct(10) },    // recuperación: ¿vuelven los tiempos normales?
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_failed{etapa:prueba}': ['rate<0.05'],
    'http_req_duration{etapa:prueba}': ['p(95)<2000'],
  },
};

export function setup() {
  exigirServiciosArriba();
  exigirSeedDeVuelos(RUTAS.carga);
  const tokens = prepararClientes(CANTIDAD_CLIENTES);
  exigirPaquete(tokens[0], PAQUETES.carga);
  return { tokens };
}

export default function (d) {
  sesionDeUsuario(d.tokens[(__VU - 1) % d.tokens.length], 0.5);
}
