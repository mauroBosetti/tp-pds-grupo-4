-- Datos para pruebas de carga (k6) en la base de ctv-backend.
-- Se ejecuta DESPUÉS de k6-limpiar.sql (seed.sh cargar hace ambas cosas).
-- Los ids fijos deben coincidir con k6/lib/config.js.
BEGIN;

INSERT INTO agencia (id, nombre, codigo_de_grupo)
VALUES ('00000000-0000-4000-8000-0000000000a1', 'K6 Agencia', '90000001');

-- Paquetes fijos usados por los escenarios (vuelos 9001..9004 de seeds/vuelos/k6.sql)
INSERT INTO paquete (id, nombre, precio, origen, destino, vuelo_ida_id, vuelo_vuelta_id, agencia_id) VALUES
  ('00000000-0000-4000-8000-000000009001', 'K6 Paquete Carga',     1000, 'K6 Carga Origen',     'K6 Carga Destino',     9001, 9002, '00000000-0000-4000-8000-0000000000a1'),
  ('00000000-0000-4000-8000-000000009002', 'K6 Paquete Sobreventa', 1000, 'K6 Sobreventa Origen', 'K6 Sobreventa Destino', 9003, 9004, '00000000-0000-4000-8000-0000000000a1');

-- 500 paquetes extra para que el catálogo tenga volumen
INSERT INTO paquete (id, nombre, precio, origen, destino, vuelo_ida_id, vuelo_vuelta_id, agencia_id)
SELECT gen_random_uuid(), 'K6 Catalogo ' || n, 500 + n, 'K6 Carga Origen', 'K6 Carga Destino', 9001, 9002,
       '00000000-0000-4000-8000-0000000000a1'
FROM generate_series(1, 500) AS n;

-- 100 usuarios que opinan (no inician sesión) y ~10.000 opiniones
WITH nuevas AS (
  INSERT INTO cuenta (id, email, hash_clave)
  SELECT gen_random_uuid(), 'k6-opinante-' || n || '@k6.test', 'sin-login'
  FROM generate_series(1, 100) AS n
  RETURNING id, email
)
INSERT INTO usuario_cliente (id, nombre, cuenta_id)
SELECT gen_random_uuid(),
       'K6 Opinante ' || replace(replace(email, 'k6-opinante-', ''), '@k6.test', ''),
       id
FROM nuevas;

INSERT INTO opinion (usuario_cliente_id, paquete_id, favorito, comentario, puntaje)
SELECT u.id, p.id, false, 'opinion k6', 1 + (u.n * p.n) % 5
FROM (SELECT id, row_number() OVER (ORDER BY nombre) AS n FROM usuario_cliente WHERE nombre LIKE 'K6 Opinante %') u
JOIN (SELECT id, row_number() OVER (ORDER BY nombre) AS n FROM paquete WHERE nombre LIKE 'K6 Catalogo %') p
  ON (u.n + p.n) % 5 = 0;

COMMIT;
