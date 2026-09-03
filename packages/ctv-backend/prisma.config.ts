// prisma.config.ts
import 'dotenv/config'; // Asegura que lea las variables del archivo .env
import { defineConfig, env } from "prisma/config"; // Helpers oficiales de Prisma 7

export default defineConfig({
  // 1. Ubicación del archivo de modelos
  schema: 'prisma/schema.prisma',

  // 2. Configuración de migraciones y semillas
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },

  // 3. Cadena de conexión segura del ORM de Prisma 7
  datasource: {
    url: env("DATABASE_URL"), 
  },
});
