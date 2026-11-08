export class ClienteInexistente extends Error {
  constructor() {
    super('El cliente no existe')
  }
}
