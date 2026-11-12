// Smoke: 1 usuario durante 30s. Valida que los scripts, el seed y los servicios funcionan antes de cargar.
import { sleep } from 'k6';
import { prepararClientes, tokenDeAgencia } from './lib/clientes.js';
import { exigirServiciosArriba, exigirSeedDeVuelos, exigirPaquete } from './lib/entorno.js';
import { RUTAS, PAQUETES } from './lib/config.js';
import {
  consultarCatalogo, consultarDetalle, listarVuelos, comprarPaquete, consultarCompras, flujoAgencia,
} from './lib/flujos.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: { checks: ['rate==1'], 'http_req_failed{etapa:prueba}': ['rate==0'] },
};

export function setup() {
  exigirServiciosArriba();
  exigirSeedDeVuelos(RUTAS.carga);
  const [cliente] = prepararClientes(1);
  const agencia = tokenDeAgencia();
  exigirPaquete(cliente, PAQUETES.carga);
  return { cliente, agencia };
}

export default function (d) {
  consultarCatalogo(d.cliente);
  consultarDetalle(d.cliente);
  listarVuelos();
  comprarPaquete(d.cliente);
  consultarCompras(d.cliente);
  flujoAgencia(d.agencia);
  sleep(1);
}
