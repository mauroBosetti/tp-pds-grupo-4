CREATE TABLE IF NOT EXISTS vuelos (
    id_vuelo SERIAL PRIMARY KEY,
    origen varchar(255) NOT NULL,
    destino varchar(255) NOT NULL,
    fecha timestamp NOT NULL,
    disponibilidad int NOT NULL
);

INSERT INTO vuelos (origen, destino, fecha, disponibilidad) VALUES
('Buenos Aires', 'Madrid', '2024-07-01 10:00:00', 100),
('Madrid', 'Buenos Aires', '2024-07-02 15:00:00', 80),
('Buenos Aires', 'New York', '2024-07-03 08:00:00', 120),
('New York', 'Buenos Aires', '2024-07-04 12:00:00', 90),
('Buenos Aires', 'Paris', '2024-07-05 09:00:00', 110),
('Paris', 'Buenos Aires', '2024-07-06 14:00:00', 70);