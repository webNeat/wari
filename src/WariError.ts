import type { ErrorDetails, ErrorKey } from "./types.js";

export class WariError<K extends ErrorKey> extends Error {
  constructor(public type: K, public details: ErrorDetails<K>) {
    super(`${type}: ${JSON.stringify(details)}`)
  }
}