import http from 'k6/http';

// Pedido HTTP con JSON, token opcional y tags.
// - nombre: tag "name" (agrupa las URLs con ids en una sola métrica)
// - etapa: 'prueba' | 'preparacion'; los umbrales solo miran 'prueba'
// - estadosEsperados: códigos que NO cuentan como fallo en http_req_failed (ej. 409 en sobreventa)
export function pedir(metodo, url, { nombre, token, cuerpo, etapa = 'prueba', estadosEsperados } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const params = { headers, tags: { name: nombre || url, etapa } };
  if (estadosEsperados) params.responseCallback = http.expectedStatuses(...estadosEsperados);
  const body = cuerpo === undefined ? null : JSON.stringify(cuerpo);
  return http.request(metodo, url, body, params);
}
