-- Limpia todo lo creado por k6 en la base de ctv-backend.
-- El orden respeta las claves foráneas (compra/opinion antes que paquete y usuarios).
BEGIN;
DELETE FROM compra WHERE paquete_id IN (SELECT id FROM paquete WHERE agencia_id = '00000000-0000-4000-8000-0000000000a1')
   OR usuario_cliente_id IN (SELECT id FROM usuario_cliente WHERE nombre LIKE 'K6 %');
DELETE FROM opinion WHERE paquete_id IN (SELECT id FROM paquete WHERE agencia_id = '00000000-0000-4000-8000-0000000000a1')
   OR usuario_cliente_id IN (SELECT id FROM usuario_cliente WHERE nombre LIKE 'K6 %');
DELETE FROM paquete WHERE agencia_id = '00000000-0000-4000-8000-0000000000a1';
DELETE FROM usuario_cliente WHERE nombre LIKE 'K6 %';
DELETE FROM usuario_agencia WHERE agencia_id = '00000000-0000-4000-8000-0000000000a1';
DELETE FROM cuenta WHERE email LIKE '%@k6.test';
DELETE FROM agencia WHERE id = '00000000-0000-4000-8000-0000000000a1';
COMMIT;
