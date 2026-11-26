// Configuración común. Los ids, rutas y capacidades DEBEN coincidir con seeds/*/k6.sql.

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const VUELOS_URL = __ENV.VUELOS_URL || 'http://localhost:4000';

export const CLAVE_K6 = 'k6-clave-123';
export const CANTIDAD_CLIENTES = parseInt(__ENV.CLIENTES || '20', 10);
export const CODIGO_AGENCIA_K6 = '90000001';

export const RUTAS = {
  carga: { origen: 'K6 Carga Origen', destino: 'K6 Carga Destino' },
  sobreventa: { origen: 'K6 Sobreventa Origen', destino: 'K6 Sobreventa Destino' },
};

export const PAQUETES = {
  carga: '00000000-0000-4000-8000-000000009001',
  sobreventa: '00000000-0000-4000-8000-000000009002',
};

export const VUELOS_SOBREVENTA = { ida: 9003, vuelta: 9004 };
export const CAPACIDAD_IDA_SOBREVENTA = 30;
export const CAPACIDAD_VUELTA_SOBREVENTA = 1000;
