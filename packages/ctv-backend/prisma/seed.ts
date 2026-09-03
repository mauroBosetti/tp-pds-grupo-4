import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// ¡Problema resuelto! Ya no da error de argumentos
const prisma = new PrismaClient({ adapter }); 


async function main() {
  console.log('Limpiando base de datos...');
  // Borra los datos existentes de atrás hacia adelante (hijos primero, padres después)
  await prisma.agencia.deleteMany();
  
  console.log('Insertando nuevos datos de prueba...');
  // Aquí continúa tu código tal cual lo tienes con los .create()...
    const agencia = await prisma.agencia.create({
    data: {
      nombre: 'Viajes del Sur',
      codigoDeGrupo: 'sarasa',
    },
  });

  // console.log('Seed completado:', { admin: admin.email, usuarioAgencia: usuarioAgencia.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });