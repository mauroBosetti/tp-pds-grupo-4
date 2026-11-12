// Carga: tráfico normal sostenido (VUS usuarios virtuales). Los umbrales definen qué es "aceptable".
import { prepararClientes } from './lib/clientes.js';
import { exigirServiciosArriba, exigirSeedDeVuelos, exigirPaquete } from './lib/entorno.js';
import { RUTAS, PAQUETES, CANTIDAD_CLIENTES } from './lib/config.js';
import { sesionDeUsuario } from './lib/flujos.js';

const VUS = parseInt(__ENV.VUS || '30', 10);

export const options = {
  stages: [
    { duration: '30s', target: VUS }, // subida gradual
    { duration: '2m', target: VUS },  // carga sostenida
    { duration: '15s', target: 0 },   // bajada
  ],
  thresholds: {
    'http_req_failed{etapa:prueba}': ['rate<0.01'],
    'http_req_duration{etapa:prueba}': ['p(95)<800'],
    'http_req_duration{name:catalogo}': ['p(95)<800'],
    'http_req_duration{name:detalle}': ['p(95)<500'],
    'http_req_duration{name:vuelos}': ['p(95)<500'],
    'http_req_duration{name:comprar}': ['p(95)<1000'],
    checks: ['rate>0.99'],
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
  sesionDeUsuario(d.tokens[(__VU - 1) % d.tokens.length], 1);
}
