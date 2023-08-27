import type { ErrorDetails, ErrorKey } from './types/index.js'

export class Err<K extends ErrorKey = 'Unknown'> extends Error {
  constructor(public type: K, public details: ErrorDetails<K>) {
    super(`${type}: ${JSON.stringify(details)}`)
  }
}
