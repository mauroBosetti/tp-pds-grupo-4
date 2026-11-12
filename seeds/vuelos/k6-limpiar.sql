-- Limpia los datos de k6 en la base de api-vuelos (ids reservados 9001-9099).
-- Borrar las ventas primero: venta_vuelos cae en cascada.
BEGIN;
DELETE FROM ventas WHERE id_venta IN (
  SELECT id_venta FROM venta_vuelos WHERE id_vuelo BETWEEN 9001 AND 9099
);
DELETE FROM vuelos WHERE id_vuelo BETWEEN 9001 AND 9099;
COMMIT;
