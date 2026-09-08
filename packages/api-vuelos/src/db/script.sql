CREATE TABLE IF NOT EXISTS vuelos (
    id_vuelo SERIAL PRIMARY KEY,
    aerolinea VARCHAR(100) NOT NULL,
    origen varchar(255) NOT NULL,
    destino varchar(255) NOT NULL,
    fecha timestamp NOT NULL,
    capacidad INT NOT NULL,
    disponibilidad int NOT NULL
);

INSERT INTO vuelos (aerolinea, origen, destino, fecha, capacidad, disponibilidad) VALUES
('Aerolíneas Argentinas', 'Buenos Aires', 'Madrid', '2027-07-01 10:00:00', 150, 100),
('Iberia', 'Madrid', 'Buenos Aires', '2027-07-02 15:00:00', 150, 80),
('Aerolíneas Argentinas', 'Buenos Aires', 'New York', '2027-07-03 08:00:00', 120, 120),
('Iberia', 'New York', 'Buenos Aires', '2027-07-04 12:00:00', 90, 90),
('Aerolíneas Argentinas', 'Buenos Aires', 'Paris', '2027-07-05 09:00:00', 110, 110),
('Iberia', 'Paris', 'Buenos Aires', '2027-07-06 14:00:00', 70, 70);