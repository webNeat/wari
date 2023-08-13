import { WariError } from './WariError.js'
import type { ErrorDetails, ErrorHandlers, ErrorKey, GetErrorKeys, MatchReturn, Normalize } from './types.js'

export type { ErrorTypes } from './types.js'

export function make<K extends ErrorKey>(type: K, details: ErrorDetails<K>) {
  return new WariError(type, details)
}

export function is<E, K extends GetErrorKeys<E>>(error: E, type: K): error is E & WariError<K> {
  return error instanceof WariError && error.type === type
}

export function match<E, H extends ErrorHandlers<E>>(error: E, handlers: H): Normalize<MatchReturn<E, H>> {
  const fn = handlers[(error as any)?.type as GetErrorKeys<E>] as any
  if (error instanceof WariError && fn !== undefined) {
    return fn(error as any)
  }
  return error as any
}
