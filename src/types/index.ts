import { Equal } from 'just-types/test'
import type { Err } from '../Err.js'
import { VoidToUndefined } from './utils.js'

export interface ErrorTypes {
  Unknown: { error: unknown }
}
export type ErrorKey = keyof ErrorTypes
export type ErrorDetails<K extends ErrorKey = ErrorKey> = ErrorTypes[K]

export type GetErrorKeys<E> = E extends Err<infer K> ? K : never

export type GuardReturn<T> = Equal<T, never> extends true ? Err<'Unknown'> : T extends Promise<infer R> ? Promise<R | Err<'Unknown'>> : T | Err<'Unknown'>

export type MatchHandlers<E, H = GetMatchHandlers<E>> = H | (Partial<H> & GetDefaultHandler<E>)

export type Handler<K extends ErrorKey> = (x: Err<K>) => any
type GetMatchHandlers<E> = { [key in GetErrorKeys<E>]: Handler<key> }
type GetDefaultHandler<E> = Err<any> extends E ? Record<'_', (x: Extract<E, Err<any>>) => any> : undefined

export type MatchReturn<E, H extends Record<string, (x: any) => any>> = Exclude<E, Err<any>> | VoidToUndefined<ReturnType<H[keyof H]>>
