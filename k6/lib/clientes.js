import { fail } from 'k6';
import { pedir } from './http.js';
import { BASE_URL, CLAVE_K6, CODIGO_AGENCIA_K6 } from './config.js';

const AYUDA = 'Revisá que el backend esté levantado y que hayas corrido: bash seeds/seed.sh cargar';

// Registra (si no existe) y loguea. bcrypt es costoso en CPU: por eso se hace una vez en setup().
function registrarYLoguear(rol, rutaRegistro, rutaLogin, datos) {
  const reg = pedir('POST', `${BASE_URL}${rutaRegistro}`, {
    nombre: `registro-${rol}`, etapa: 'preparacion', estadosEsperados: [201, 409],
    cuerpo: datos,
  });
  if (reg.status !== 201 && reg.status !== 409) {
    fail(`No se pudo registrar ${datos.email} (status ${reg.status}). ${AYUDA}`);
  }
  const login = pedir('POST', `${BASE_URL}${rutaLogin}`, {
    nombre: `login-${rol}`, etapa: 'preparacion',
    cuerpo: { email: datos.email, clave: datos.clave },
  });
  if (login.status !== 200) fail(`Login falló para ${datos.email} (status ${login.status}). ${AYUDA}`);
  return login.json('token');
}

export function tokenDeCliente(n) {
  return registrarYLoguear('cliente', '/api/auth/cliente/registro', '/api/auth/cliente/login', {
    nombre: `K6 Cliente ${n}`,
    email: `k6-cliente-${n}@k6.test`,
    clave: CLAVE_K6,
  });
}

export function prepararClientes(cantidad) {
  const tokens = [];
  for (let i = 1; i <= cantidad; i++) tokens.push(tokenDeCliente(i));
  return tokens;
}

export function tokenDeAgencia() {
  return registrarYLoguear('agencia', '/api/auth/agencia/registro', '/api/auth/agencia/login', {
    nombre: 'K6 Agencia Usuario',
    email: 'k6-agencia@k6.test',
    clave: CLAVE_K6,
    codigoDeGrupo: CODIGO_AGENCIA_K6,
  });
}
