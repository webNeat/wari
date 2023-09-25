import { Equal } from 'just-types/test'
import type { Err } from '../Err.js'
import { VoidToUndefined } from './utils.js'

export interface ErrorTypes {
  Unknown: { error: unknown }
}
export type ErrorKey = keyof ErrorTypes
export type ErrorDetails<K extends ErrorKey = ErrorKey> = ErrorTypes[K]

export type GetErrorKeys<E> = E extends Err<infer K> ? K : never

export type GuardReturn<T, U> = Equal<T, never> extends true ? U : T extends Promise<infer R> ? Promise<R | U> : T | U

export type MatchHandlers<E> = {
  [key in GetErrorKeys<E>]: Handler<key>
}
export type MatchDefaultHandler<E, H> = Handler<Exclude<GetErrorKeys<E>, keyof H>>

export type Handler<K extends ErrorKey> = (x: Err<K>) => any
export type MatchReturn<E, H extends Record<string, (x: any) => any>> = Exclude<E, Err<any>> | VoidToUndefined<ReturnType<H[keyof H]>>
