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
  await prisma.paqueteFavorito.deleteMany();
  await prisma.paquete.deleteMany();
  await prisma.vuelo.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.perfilAgencia.deleteMany();
  await prisma.perfilComprador.deleteMany();
  await prisma.perfilAdministrador.deleteMany();
  await prisma.agencia.deleteMany();
  await prisma.usuario.deleteMany();
  
  console.log('Insertando nuevos datos de prueba...');
  // Aquí continúa tu código tal cual lo tienes con los .create()...
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@ctv.com',
      password: 'hash_de_ejemplo',
      nombre: 'Ana',
      apellido: 'Administradora',
      rol: 'ADMINISTRADOR',
      perfilAdministrador: { create: {} },
    },
  });

  const agencia = await prisma.agencia.create({
    data: {
      nombre: 'Viajes del Sur',
      cuit: '30-12345678-9',
      email: 'contacto@viajesdelsur.com',
    },
  });

  const usuarioAgencia = await prisma.usuario.create({
    data: {
      email: 'agencia@viajesdelsur.com',
      password: 'hash_de_ejemplo',
      nombre: 'Carlos',
      apellido: 'Gerente',
      rol: 'AGENCIA',
      perfilAgencia: { create: { agenciaId: agencia.id, cargo: 'Gerente' } },
    },
  });

  const comprador = await prisma.usuario.create({
    data: {
      email: 'comprador@ctv.com',
      password: 'hash_de_ejemplo',
      nombre: 'Lucía',
      apellido: 'Cliente',
      rol: 'COMPRADOR',
      perfilComprador: { create: {} },
    },
    include: { perfilComprador: true },
  });

  const hotel = await prisma.hotel.create({
    data: {
      nombre: 'Hotel Costa Azul',
      destino: 'Bariloche',
      estrellas: 4,
    },
  });

  const vueloIda = await prisma.vuelo.create({
    data: {
      externalFlightId: 'EXT-IDA-001',
      aerolinea: 'Aerolíneas Argentinas',
      numeroVuelo: 'AR1234',
      origen: 'Buenos Aires',
      destino: 'Bariloche',
      fechaHoraSalida: new Date('2026-12-10T08:00:00Z'),
      fechaHoraLlegada: new Date('2026-12-10T10:30:00Z'),
      precio: 85000,
    },
  });

  const vueloVuelta = await prisma.vuelo.create({
    data: {
      externalFlightId: 'EXT-VUELTA-001',
      aerolinea: 'Aerolíneas Argentinas',
      numeroVuelo: 'AR1235',
      origen: 'Bariloche',
      destino: 'Buenos Aires',
      fechaHoraSalida: new Date('2026-12-17T18:00:00Z'),
      fechaHoraLlegada: new Date('2026-12-17T20:30:00Z'),
      precio: 85000,
    },
  });

  const paquete = await prisma.paquete.create({
    data: {
      nombre: 'Bariloche 7 noches',
      descripcion: 'Escapada a la Patagonia con hotel 4 estrellas',
      precio: 450000,
      destino: 'Bariloche',
      fechaInicio: new Date('2026-12-10'),
      fechaFin: new Date('2026-12-17'),
      agenciaId: agencia.id,
      hotelId: hotel.id,
      vueloIdaId: vueloIda.id,
      vueloVueltaId: vueloVuelta.id,
    },
  });

  await prisma.paqueteFavorito.create({
    data: {
      perfilCompradorId: comprador.perfilComprador!.id,
      paqueteId: paquete.id,
    },
  });

  console.log('Seed completado:', { admin: admin.email, usuarioAgencia: usuarioAgencia.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });