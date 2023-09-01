import { Err } from './Err.js'
import type { ErrorDetails, ErrorKey, GetErrorKeys, GuardReturn, MatchDefaultHandler, MatchHandlers, MatchReturn } from './types/index.js'

export function make<K extends ErrorKey>(type: K, details: ErrorDetails<K>) {
  return new Err(type, details)
}

// @ts-expect-error
export function is<E, K extends GetErrorKeys<E>>(error: E, type: K): error is Err<K> {
  return error instanceof Err && error.type === type
}

// @ts-expect-error
export function any<E, K = GetErrorKeys<E>>(error: E): error is K extends never ? E : Err<K> {
  return error instanceof Err
}

export function match<E, H extends MatchHandlers<E> = MatchHandlers<E>>(error: E, handlers: H): MatchReturn<E, H>
export function match<E, H extends Partial<MatchHandlers<E>>>(
  error: E,
  handlers: H,
  defaultHandler: MatchDefaultHandler<E, H>,
): MatchReturn<E, H & { _: MatchDefaultHandler<E, H> }>
export function match(error: unknown, ...args: any[]) {
  if (!(error instanceof Err)) return error as any
  let [handlers, defaultHandler] = args
  handlers = handlers || {}
  const fn = handlers[error.type] || defaultHandler
  if (!fn) return new Err('Unknown', { error: new Error(`wari: missing error type '${error.type}' in match call`) })
  return fn(error as any)
}

export function tryCatch<Args extends any[], T>(fn: (...args: Args) => T, ...args: Args): GuardReturn<T> {
  try {
    const res = fn(...args)
    if (res instanceof Promise) {
      return res.catch((error) => new Err('Unknown', { error })) as any
    }
    return res as any
  } catch (error) {
    return new Err('Unknown', { error }) as any
  }
}
