import jwt from 'jsonwebtoken'

const secreto = process.env.JWT_SECRET ?? 'dev-secret-no-usar-en-produccion'
const duracion = '8h'

export interface DatosToken {
  sub: string
  rol: 'administrador'
  nombre: string
}

export function firmarToken(datos: DatosToken): string {
  return jwt.sign(datos, secreto, { expiresIn: duracion })
}

export function verificarToken(token: string): DatosToken {
  return jwt.verify(token, secreto) as DatosToken
}
