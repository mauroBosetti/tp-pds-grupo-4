-- Vuelos para pruebas de carga (k6). Ids fijos 9001-9004 para no chocar con los vuelos reales.
-- Los valores deben coincidir con k6/lib/config.js.
--   9001/9002: ruta de carga, capacidad enorme (nunca se agota)
--   9003/9004: ruta de sobreventa; ida con 30 asientos, vuelta con 1000
BEGIN;
DELETE FROM ventas WHERE id_venta IN (
  SELECT id_venta FROM venta_vuelos WHERE id_vuelo BETWEEN 9001 AND 9099
);
DELETE FROM vuelos WHERE id_vuelo BETWEEN 9001 AND 9099;

INSERT INTO vuelos (id_vuelo, aerolinea, origen, destino, fecha, capacidad, disponibilidad) VALUES
  (9001, 'K6 Test', 'K6 Carga Origen',     'K6 Carga Destino',     '2030-01-10 10:00:00', 1000000, 1000000),
  (9002, 'K6 Test', 'K6 Carga Destino',    'K6 Carga Origen',      '2030-01-20 10:00:00', 1000000, 1000000),
  (9003, 'K6 Test', 'K6 Sobreventa Origen',  'K6 Sobreventa Destino', '2030-02-10 10:00:00', 30,   30),
  (9004, 'K6 Test', 'K6 Sobreventa Destino', 'K6 Sobreventa Origen',  '2030-02-20 10:00:00', 1000, 1000);
COMMIT;
