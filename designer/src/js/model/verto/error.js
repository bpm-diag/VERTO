/* eslint-disable camelcase */

export class VERTOModelStringParsingError extends Error {
  constructor (message) {
    super(message)
    this.name = 'VERTOModelStringParsingError'
    console.error(`[${this.name}] ${message}`)
  }
}
