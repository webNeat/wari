import { Equal, Extends, Is } from 'just-types/test'
import { SubSequence } from 'just-types/tuple'
import type { Err } from '../Err.js'
import { Prettify, ToTuple, VoidToUndefined } from './utils.js'

export interface ErrorTypes {
  Unknown: { error: unknown }
}
export type ErrorKey = keyof ErrorTypes
export type ErrorDetails<K extends ErrorKey = ErrorKey> = ErrorTypes[K]

export type GetErrorKeys<E> = E extends Err<infer K> ? K : never

export type GuardReturn<T> = Equal<T, never> extends true ? Err<'Unknown'> : T extends Promise<infer R> ? Promise<R | Err<'Unknown'>> : T | Err<'Unknown'>

export type MatchHandlers<E, Keys = ToTuple<GetErrorKeys<E>>> = Prettify<
  // @ts-expect-error
  {
    // @ts-expect-error
    [R in SubSequence<Keys> as `${R}`]: { [key in R[number]]: Handler<key> } & (Keys extends R ? {} : { _: Handler<Exclude<Keys[number], R[number]>> })
  }[string]
>
export type Handler<K extends ErrorKey> = (x: Err<K>) => any
export type MatchReturn<E, H extends Record<string, (x: any) => any>> = Exclude<E, Err<any>> | VoidToUndefined<ReturnType<H[keyof H]>>
