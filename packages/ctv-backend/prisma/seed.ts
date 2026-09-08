import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function crearAdministradores() {
  interface AdministradorSemilla {
    nombre: string
    email: string
    password: string
  }

  function leerAdministradores(): AdministradorSemilla[] {
    return [1, 2, 3].map((numero) => {
      const nombre = process.env[`ADMIN${numero}_NOMBRE`]
      const email = process.env[`ADMIN${numero}_EMAIL`]
      const password = process.env[`ADMIN${numero}_PASSWORD`]
      if (!nombre || !email || !password) {
        throw new Error(`Faltan variables de entorno para el administrador ${numero}`)
      }
      return { nombre, email, password }
    })
  }

  async function crearAdministrador({ nombre, email, password }: AdministradorSemilla) {
    const hashClave = await bcrypt.hash(password, 10)
    await prisma.cuenta.upsert({
      where: { email },
      update: {},
      create: {
        email,
        hashClave,
        usuarioAdministrador: { create: { nombre } },
      },
    })
  }

  for (const administrador of leerAdministradores()) {
    await crearAdministrador(administrador)
  }
  console.log('Administradores creados')
}

async function main() {
  console.log('Limpiando base de datos...');
  // Borra los datos existentes de atrás hacia adelante (hijos primero, padres después)
  await prisma.agencia.deleteMany();

  console.log('Insertando nuevos datos de prueba...');
  const agencia = await prisma.agencia.create({
    data: {
      nombre: 'Viajes del Sur',
      codigoDeGrupo: 'sarasa',
    },
  });

  await crearAdministradores();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });