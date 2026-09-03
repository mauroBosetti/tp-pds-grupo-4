import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const cliente = new PrismaClient()

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
  await cliente.cuenta.upsert({
    where: { email },
    update: {},
    create: {
      email,
      hashClave,
      usuarioAdministrador: { create: { nombre } },
    },
  })
}

async function main() {
  for (const administrador of leerAdministradores()) {
    await crearAdministrador(administrador)
  }
  console.log('Administradores creados')
}

main()
  .then(() => cliente.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await cliente.$disconnect()
    process.exit(1)
  })
