// Sobreventa vía backend: 200 intentos concurrentes de comprar un paquete cuyo vuelo de ida tiene 30 asientos.
// Esperado: exactamente 30 compras (201) y el resto 409; sin errores y base consistente.
import { pedir } from './lib/http.js';
import { BASE_URL, PAQUETES, CANTIDAD_CLIENTES } from './lib/config.js';
import { prepararClientes } from './lib/clientes.js';
import { exigirPaquete } from './lib/entorno.js';
import {
  opcionesSobreventa, clasificar, verificarSeedFresco, verificarConsistencia,
} from './lib/sobreventa.js';
import { check } from 'k6';

export const options = opcionesSobreventa();

export function setup() {
  verificarSeedFresco();
  const tokens = prepararClientes(CANTIDAD_CLIENTES);
  exigirPaquete(tokens[0], PAQUETES.sobreventa);
  return { tokens };
}

export default function (datos) {
  const token = datos.tokens[(__VU + __ITER) % datos.tokens.length];
  const res = pedir('POST', `${BASE_URL}/api/package/${PAQUETES.sobreventa}/comprar`, {
    nombre: 'comprar-sobreventa', token, estadosEsperados: [201, 409],
  });
  clasificar(res, 201);
}

export function teardown(datos) {
  verificarConsistencia();
  // La suma de compras registradas por los clientes de k6 para este paquete debe ser exactamente la capacidad.
  let total = 0;
  for (const token of datos.tokens) {
    const res = pedir('GET', `${BASE_URL}/api/compras`, { nombre: 'compras-teardown', token, etapa: 'preparacion' });
    if (res.status === 200) {
      // Se busca el id en el JSON de cada compra para no depender de la forma exacta de la respuesta.
      total += res.json().filter((c) => JSON.stringify(c).includes(PAQUETES.sobreventa)).length;
    }
  }
  check(null, { 'compras registradas == 30': () => total === 30 });
}
