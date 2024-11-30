import type { ErrorDetails, ErrorKey } from './types/index.js'

export class Err<K extends ErrorKey = 'Unknown'> extends Error {
  constructor(
    public type: K,
    public details: ErrorDetails<K>,
  ) {
    super(`${type}: ${JSON.stringify(details, getCircularReplacer())}`)
  }
}

function getCircularReplacer() {
  const ancestors: unknown[] = []
  return function (_: string, value: unknown) {
    if (typeof value !== 'object' || value === null) return value
    // @ts-ignore
    while (ancestors.length > 0 && ancestors.at(-1) !== this) ancestors.pop()
    if (ancestors.includes(value)) return '[Circular]'
    ancestors.push(value)
    return value
  }
}
