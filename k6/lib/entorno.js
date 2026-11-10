import { fail } from 'k6';
import { pedir } from './http.js';
import { BASE_URL, VUELOS_URL, RUTAS, PAQUETES } from './config.js';

// Falla rápido y con mensaje claro si los servicios no están arriba.
export function exigirServiciosArriba() {
  const hola = pedir('GET', `${BASE_URL}/hola`, { nombre: 'hola', etapa: 'preparacion' });
  if (hola.status !== 200) fail(`El backend no responde en ${BASE_URL} (status ${hola.status}).`);
  const v = pedir('GET', `${VUELOS_URL}/api/vuelos?origen=x&destino=y&fecha=2030-01-01`, {
    nombre: 'vuelos-ping', etapa: 'preparacion',
  });
  if (v.status === 0 || v.status >= 500) fail(`api-vuelos no responde en ${VUELOS_URL} (status ${v.status}).`);
}

export function vuelosDisponibles(origen, destino) {
  const url = `${VUELOS_URL}/api/vuelos?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`;
  const res = pedir('GET', url, { nombre: 'vuelos-consulta', etapa: 'preparacion' });
  if (res.status !== 200) fail(`Consulta de vuelos falló (status ${res.status}).`);
  return res.json();
}

export function exigirSeedDeVuelos(ruta) {
  const lista = vuelosDisponibles(ruta.origen, ruta.destino);
  if (!Array.isArray(lista) || lista.length === 0) {
    fail(`No hay vuelos ${ruta.origen} -> ${ruta.destino}. Corré: bash seeds/seed.sh cargar`);
  }
  return lista;
}

export function exigirPaquete(token, id) {
  const res = pedir('GET', `${BASE_URL}/api/package/${id}`, { nombre: 'detalle-prep', token, etapa: 'preparacion' });
  if (res.status !== 200) fail(`No existe el paquete ${id} (status ${res.status}). Corré: bash seeds/seed.sh cargar`);
}

export { RUTAS, PAQUETES };
