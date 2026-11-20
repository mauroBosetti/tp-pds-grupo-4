-- =============================================================================
-- SCRIPT DE DATOS DE PRUEBA COMPLETO PARA CTV
-- =============================================================================
-- Contraseña para TODOS los usuarios creados: password123
-- Hash bcrypt correspondiente: $2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae
-- =============================================================================

BEGIN;

-- 1. LIMPIEZA PREVIA (Opcional, en orden inverso a relaciones de FK)
DELETE FROM opinion;
DELETE FROM compra;
DELETE FROM paquete;
DELETE FROM hotel;
DELETE FROM usuario_agencia;
DELETE FROM usuario_cliente;
DELETE FROM usuario_administrador;
DELETE FROM cuenta;
DELETE FROM agencia;

-- 2. CUENTAS Y USUARIOS ADMINISTRADORES
-- admin@ctv.com / password123
-- ada@ctv.com / password123
INSERT INTO cuenta (id, email, hash_clave) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'admin@ctv.com', '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('a0000000-0000-4000-8000-000000000002', 'ada@ctv.com',   '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae');

INSERT INTO usuario_administrador (id, nombre, cuenta_id) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Admin Principal', 'a0000000-0000-4000-8000-000000000001'),
  ('a1000000-0000-4000-8000-000000000002', 'Ada Lovelace',    'a0000000-0000-4000-8000-000000000002');

-- 3. AGENCIAS REGISTRADAS (6 agencias para poder visualizar Top 5)
INSERT INTO agencia (id, nombre, codigo_de_grupo) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'Turismo Sur',         'SUR00001'),
  ('b0000000-0000-4000-8000-000000000002', 'Mundo Aventura',      'ADV00002'),
  ('b0000000-0000-4000-8000-000000000003', 'Viajes del Sol',      'SOL00003'),
  ('b0000000-0000-4000-8000-000000000004', 'Rutas Globales',      'RUT00004'),
  ('b0000000-0000-4000-8000-000000000005', 'Horizonte Viajes',    'HOR00005'),
  ('b0000000-0000-4000-8000-000000000006', 'Patagonia Explorer',  'PAT00006');

-- 4. CUENTAS Y USUARIOS DE AGENCIA
INSERT INTO cuenta (id, email, hash_clave) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'bruno@turismosur.com',  '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('b1000000-0000-4000-8000-000000000002', 'marcos@mundoavent.com', '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('b1000000-0000-4000-8000-000000000003', 'lucia@viajessol.com',   '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae');

INSERT INTO usuario_agencia (id, nombre, cuenta_id, agencia_id) VALUES
  ('b2000000-0000-4000-8000-000000000001', 'Bruno Gómez',  'b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001'),
  ('b2000000-0000-4000-8000-000000000002', 'Marcos Ruiz',  'b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002'),
  ('b2000000-0000-4000-8000-000000000003', 'Lucía Rossi',  'b1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003');

-- 5. CUENTAS Y USUARIOS CLIENTES (Compradores)
INSERT INTO cuenta (id, email, hash_clave) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'clara@gmail.com',    '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('c0000000-0000-4000-8000-000000000002', 'martin@gmail.com',   '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('c0000000-0000-4000-8000-000000000003', 'sofia@gmail.com',    '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('c0000000-0000-4000-8000-000000000004', 'lucas@gmail.com',    '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('c0000000-0000-4000-8000-000000000005', 'valentina@gmail.com','$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae'),
  ('c0000000-0000-4000-8000-000000000006', 'joaquin@gmail.com',  '$2a$10$wT0C0c9V.u7y8gUeKq9Zwe7S/gI/dK2bBvjL.HkFk7A6o3N3g5Qae');

INSERT INTO usuario_cliente (id, nombre, cuenta_id) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'Clara Benítez',     'c0000000-0000-4000-8000-000000000001'),
  ('c1000000-0000-4000-8000-000000000002', 'Martín Rodríguez',  'c0000000-0000-4000-8000-000000000002'),
  ('c1000000-0000-4000-8000-000000000003', 'Sofía Martínez',    'c0000000-0000-4000-8000-000000000003'),
  ('c1000000-0000-4000-8000-000000000004', 'Lucas Pérez',       'c0000000-0000-4000-8000-000000000004'),
  ('c1000000-0000-4000-8000-000000000005', 'Valentina Díaz',   'c0000000-0000-4000-8000-000000000005'),
  ('c1000000-0000-4000-8000-000000000006', 'Joaquín Silva',     'c0000000-0000-4000-8000-000000000006');

-- 6. HOTELES
INSERT INTO hotel (id, nombre, direccion, ciudad, pais, imagen) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'Gran Hotel Bariloche',     'Av. San Martín 123',       'Bariloche',      'Argentina', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
  ('d0000000-0000-4000-8000-000000000002', 'Cancun Palace Resort',     'Boulevard Kukulcan Km 14', 'Cancún',         'México',    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'),
  ('d0000000-0000-4000-8000-000000000003', 'Hotel Madrid Centro',      'Gran Vía 45',              'Madrid',         'España',    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'),
  ('d0000000-0000-4000-8000-000000000004', 'Copacabana Palace Beach',   'Av. Atlântica 1702',       'Río de Janeiro', 'Brasil',    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'),
  ('d0000000-0000-4000-8000-000000000005', 'Roma Imperial Hotel',       'Via del Corso 220',        'Roma',           'Italia',    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'),
  ('d0000000-0000-4000-8000-000000000006', 'Iguazú Rainforest Lodge',  'Ruta 12 Km 5',             'Iguazú',         'Argentina', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d');

-- 7. PAQUETES TURÍSTICOS
INSERT INTO paquete (id, nombre, precio, origen, destino, vuelo_ida_id, vuelo_vuelta_id, agencia_id, hotel_id) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'Nieve y Bosques en Bariloche',  1200, 'Buenos Aires', 'Bariloche',      1, 2, 'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000002', 'Relax Total en Cancún',         2500, 'Buenos Aires', 'Cancún',         3, 4, 'b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002'),
  ('e0000000-0000-4000-8000-000000000003', 'Escapada Cultural a Madrid',    2200, 'Buenos Aires', 'Madrid',         5, 6, 'b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000003'),
  ('e0000000-0000-4000-8000-000000000004', 'Playas de Río de Janeiro',       1400, 'Buenos Aires', 'Río de Janeiro', 7, 8, 'b0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000004'),
  ('e0000000-0000-4000-8000-000000000005', 'Historia y Pasta en Roma',      2800, 'Buenos Aires', 'Roma',           9, 10,'b0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000005'),
  ('e0000000-0000-4000-8000-000000000006', 'Maravillas de Iguazú',           950, 'Buenos Aires', 'Iguazú',        11, 12,'b0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000006'),
  ('e0000000-0000-4000-8000-000000000007', 'Fin de Semana en Bariloche',     800, 'Buenos Aires', 'Bariloche',     13, 14,'b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001');

-- 8. COMPRAS REALIZADAS (Varias compras para generar estadísticas de Top 5)
-- Clara compra 4 veces (Top 1)
INSERT INTO compra (id, fecha, usuario_cliente_id, paquete_id) VALUES
  ('d0000000-0000-4000-8000-000000000001', NOW() - INTERVAL '15 days', 'c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000002', NOW() - INTERVAL '12 days', 'c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000003', NOW() - INTERVAL '10 days', 'c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003'),
  ('d0000000-0000-4000-8000-000000000004', NOW() - INTERVAL '8 days',  'c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000007');

-- Martín compra 3 veces (Top 2)
INSERT INTO compra (id, fecha, usuario_cliente_id, paquete_id) VALUES
  ('d0000000-0000-4000-8000-000000000005', NOW() - INTERVAL '7 days',  'c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000002'),
  ('d0000000-0000-4000-8000-000000000006', NOW() - INTERVAL '5 days',  'c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000004'),
  ('d0000000-0000-4000-8000-000000000007', NOW() - INTERVAL '4 days',  'c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001');

-- Sofía compra 2 veces (Top 3)
INSERT INTO compra (id, fecha, usuario_cliente_id, paquete_id) VALUES
  ('d0000000-0000-4000-8000-000000000008', NOW() - INTERVAL '3 days',  'c1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000005'),
  ('d0000000-0000-4000-8000-000000000009', NOW() - INTERVAL '2 days',  'c1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000006');

-- Lucas compra 2 veces (Top 4)
INSERT INTO compra (id, fecha, usuario_cliente_id, paquete_id) VALUES
  ('d0000000-0000-4000-8000-000000000010', NOW() - INTERVAL '2 days',  'c1000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000011', NOW() - INTERVAL '1 day',   'c1000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000002');

-- Valentina compra 1 vez (Top 5)
INSERT INTO compra (id, fecha, usuario_cliente_id, paquete_id) VALUES
  ('d0000000-0000-4000-8000-000000000012', NOW() - INTERVAL '12 hours','c1000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000003');

-- 9. OPINIONES (Puntajes, Comentarios y Favoritos)
-- Cancún: 5 y 5 (Promedio 5.0)
-- Bariloche: 5, 4, 5 (Promedio 4.67)
-- Madrid: 4 y 5 (Promedio 4.5)
-- Roma: 4 (Promedio 4.0)
-- Río de Janeiro: 3 (Promedio 3.0)
INSERT INTO opinion (usuario_cliente_id, paquete_id, favorito, comentario, puntaje) VALUES
  -- Clara opina y guarda favoritos
  ('c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', true,  'Hermosa estadía en Bariloche, el hotel impecable.', 5),
  ('c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', true,  'El resort de Cancún superó todas mis expectativas.', 5),
  ('c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', false, 'Madrid muy lindo, buena ubicación del hotel.', 4),
  ('c1000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000007', false, 'Buen fin de semana para desconectar.', 4),

  -- Martín opina y guarda favoritos
  ('c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000002', true,  'Playa paradisíaca y excelente atención.', 5),
  ('c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000004', false, 'Río muy lindo aunque hubo demoras en el check-in.', 3),
  ('c1000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', true,  'Excelente nieve y servicio.', 5),

  -- Sofía opina y guarda favoritos
  ('c1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000005', true,  'Roma es mágica, volvería sin dudas.', 4),
  ('c1000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000006', false, 'Cataratas impresionantes.', 5),

  -- Valentina opina
  ('c1000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000003', true,  'Gran experiencia en España.', 5),

  -- Lucas guarda de interés sin opinar todavía
  ('c1000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000005', true,  NULL, NULL);

COMMIT;
