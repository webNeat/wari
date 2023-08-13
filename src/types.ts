import type { WariError } from "./WariError.js"

export interface ErrorTypes {}
export type ErrorKey = keyof ErrorTypes
export type ErrorDetails<K extends ErrorKey = ErrorKey> = ErrorTypes[K]
export type GetErrorKeys<E> = E extends WariError<infer K> ? K : never
export type ErrorHandlers<E> = {
  [key in GetErrorKeys<E>]: (x: WariError<key>) => any
}
export type MatchReturn<E, H extends ErrorHandlers<E>> = Exclude<E, WariError<keyof H & keyof ErrorTypes>> | VoidToUndefined<ReturnType<H[keyof H]>>
export type Normalize<T> = {[key in keyof T]: T[key]} & {}

type VoidToUndefined<T> = T extends void ? undefined : T
