import { Normalize } from 'just-types/common'
import { Err } from './Err.js'
import type { ErrorDetails, ErrorKey, GetErrorKeys, GuardReturn, MatchDefaultHandler, MatchHandlers, MatchReturn } from './types/index.js'

export function make<K extends ErrorKey>(type: K, details: ErrorDetails<K>) {
  return new Err(type, details)
}

export function is<E, K extends GetErrorKeys<E>>(error: E, type: K): error is Extract<E, Err<K>> {
  return error instanceof Err && error.type === type
}

export function any<E>(error: E): error is Extract<E, Err<ErrorKey>> {
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

export function tryCatch<T, R>(fn: () => T, handleError: (err: unknown) => R): GuardReturn<T, R> {
  try {
    const res = fn()
    if (res instanceof Promise) {
      return res.catch(handleError) as any
    }
    return res as any
  } catch (error) {
    return handleError(error) as any
  }
}

export function safe<Args extends any[], T, R>(
  fn: (...args: Args) => T,
  handleError: (err: unknown, args: Args) => R,
): (...args: Args) => GuardReturn<T, R> {
  return (...args: Args) => {
    try {
      const res = fn(...args)
      if (res instanceof Promise) {
        return res.catch((err) => handleError(err, args)) as any
      }
      return res as any
    } catch (error) {
      return handleError(error, args) as any
    }
  }
}
