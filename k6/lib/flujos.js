import { check, sleep } from 'k6';
import { pedir } from './http.js';
import { BASE_URL, VUELOS_URL, RUTAS, PAQUETES } from './config.js';

export function estadoEs(res, esperado, etiqueta) {
  return check(res, { [`${etiqueta} -> ${esperado}`]: (r) => r.status === esperado });
}

export function consultarCatalogo(token) {
  const res = pedir('GET', `${BASE_URL}/api/package/catalogo`, { nombre: 'catalogo', token });
  estadoEs(res, 200, 'catalogo');
  return res;
}

export function consultarDetalle(token) {
  const res = pedir('GET', `${BASE_URL}/api/package/${PAQUETES.carga}`, { nombre: 'detalle', token });
  estadoEs(res, 200, 'detalle');
  return res;
}

export function listarVuelos() {
  const r = RUTAS.carga;
  const url = `${VUELOS_URL}/api/vuelos?origen=${encodeURIComponent(r.origen)}&destino=${encodeURIComponent(r.destino)}`;
  const res = pedir('GET', url, { nombre: 'vuelos' });
  estadoEs(res, 200, 'vuelos');
  return res;
}

// El paquete de carga tiene capacidad casi infinita, así que siempre debe dar 201.
export function comprarPaquete(token) {
  const res = pedir('POST', `${BASE_URL}/api/package/${PAQUETES.carga}/comprar`, { nombre: 'comprar', token });
  estadoEs(res, 201, 'comprar');
  return res;
}

export function consultarCompras(token) {
  const res = pedir('GET', `${BASE_URL}/api/compras`, { nombre: 'compras', token });
  estadoEs(res, 200, 'compras');
  return res;
}

export function flujoAgencia(token) {
  const lista = pedir('GET', `${BASE_URL}/api/package`, { nombre: 'agencia-paquetes', token });
  estadoEs(lista, 200, 'agencia-paquetes');
  const r = RUTAS.carga;
  const vuelos = pedir('GET',
    `${BASE_URL}/api/package/vuelos?origen=${encodeURIComponent(r.origen)}&destino=${encodeURIComponent(r.destino)}`,
    { nombre: 'agencia-vuelos', token });
  estadoEs(vuelos, 200, 'agencia-vuelos');
}

// Sesión típica: ~60% navegar (catálogo + detalle), 25% buscar vuelos, 15% comprar.
// pensar: segundos de "tiempo de lectura" entre acciones.
export function sesionDeUsuario(token, pensar = 1) {
  const x = Math.random();
  if (x < 0.6) {
    consultarCatalogo(token);
    sleep(pensar);
    consultarDetalle(token);
  } else if (x < 0.85) {
    listarVuelos();
  } else {
    comprarPaquete(token);
    sleep(pensar);
    consultarCompras(token);
  }
  sleep(pensar);
}
