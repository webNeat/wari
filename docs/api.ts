/** Type-only declaration spec for the public `wari` API. */

type AnyClass = abstract new (...args: never[]) => unknown
type Instance<C> = C extends abstract new (...args: never[]) => infer I ? I : never
type IsAny<T> = 0 extends 1 & T ? true : false
type ErrorMember<T> =
  IsAny<T> extends true ? Error : unknown extends T ? Error : T extends unknown ? (T extends Error ? T : Error extends T ? Error : never) : never

type Definition = (...args: any[]) => string
type Definitions = Record<string, Definition>
type ArgsOf<D> = D extends (...args: infer A) => string ? A : never
type ValidDefinition<D> = D extends (...args: infer A) => string
  ? number extends A['length']
    ? never
    : A extends []
      ? D
      : A extends [unknown]
        ? D
        : never
  : never
type ValidDefinitions<M extends Definitions> = { [K in keyof M]: ValidDefinition<M[K]> }
type DetailsOf<D> = ArgsOf<D> extends [] ? undefined : ArgsOf<D>[0]
type ConstructorArgs<D> = ArgsOf<D> extends [] ? [] | [details: undefined, cause?: unknown] : [details: DetailsOf<D>, cause?: unknown]
type Generated<N extends string, D> = Omit<Error, 'name'> & {
  readonly name: N
  readonly details: DetailsOf<D>
  readonly cause?: unknown
}
type GeneratedClass<N extends string, D> = (ArgsOf<D> extends []
  ? { new (): Generated<N, D>; new (details: undefined, cause?: unknown): Generated<N, D> }
  : { new (details: DetailsOf<D>, cause?: unknown): Generated<N, D> }) & {
  readonly name: string
  readonly prototype: Generated<N, D>
}
type RegistryInstances<M extends Definitions> = { [K in keyof M]: Generated<Extract<K, string>, M[K]> }[keyof M]
type RegistryArgs<M extends Definitions> = { [K in keyof M]: [name: K, ...args: ConstructorArgs<M[K]>] }[keyof M]
type RegistryResult<M extends Definitions, A extends readonly unknown[]> = A extends readonly [infer K, ...unknown[]]
  ? K extends keyof M
    ? Generated<Extract<K, string>, M[K]>
    : never
  : never
type Registry<M extends Definitions> = {
  <A extends RegistryArgs<M>>(...args: A): RegistryResult<M, A>
} & { readonly [K in keyof M]: GeneratedClass<Extract<K, string>, M[K]> } & {
  readonly Error: abstract new () => RegistryInstances<M>
}

/** Create a callable registry with named constructors. */
export declare function errors<const M extends Definitions>(
  definitions: M & ValidDefinitions<M> & ('Error' extends keyof M ? never : unknown),
): Registry<M>

/** Ordinary same-realm `instanceof` guard. */
export declare function is<C extends AnyClass>(constructor: C, value: unknown): value is Instance<C>

type MatchInputs<C extends readonly AnyClass[]> = {
  [K in keyof C]: { readonly on: C[K]; readonly do: (value: Instance<C[K]>) => unknown }
}
type MatchOutputs<R extends readonly unknown[]> = {
  [K in keyof R]: { readonly on: AnyClass; readonly do: (value: never) => R[K] }
}

/** Match in order by constructor identity; unmatched input passes through. */
export declare function match<T, C extends readonly AnyClass[], R extends readonly unknown[]>(
  value: T,
  ...cases: MatchInputs<C> & MatchOutputs<R>
): Exclude<T, Instance<C[number]>> | R[number]

type AttemptResult<R, E extends Error> =
  | E
  | Exclude<R, PromiseLike<unknown>>
  | ([Extract<R, PromiseLike<unknown>>] extends [never] ? never : Promise<Awaited<Extract<R, PromiseLike<unknown>>> | E>)

/** Invoke once and map throws/rejections. Mapper throws escape without recapture. */
export declare function attempt<F extends () => any, E extends Error>(fn: F, mapper: (cause: unknown) => E): AttemptResult<ReturnType<F>, E>

/** Reusable capture wrapper, preserving receiver and argument tuple. */
export declare function safe<This, A extends unknown[], R, E extends Error>(
  fn: (this: This, ...args: A) => R,
  mapper: (cause: unknown, args: A) => E,
): (this: This, ...args: A) => AttemptResult<R, E>

type PipeStep = (value: never) => unknown
type PipeArgs<V, S extends readonly PipeStep[]> = S extends readonly [infer F extends PipeStep, ...infer Rest extends PipeStep[]]
  ? [(value: Exclude<Awaited<V>, Error>) => ReturnType<F>, ...PipeArgs<ReturnType<F>, Rest>]
  : []
type PipeImmediate<V, S extends readonly PipeStep[]> = V extends Error
  ? V
  : S extends readonly [infer F extends PipeStep, ...infer Rest extends PipeStep[]]
    ? PipeResult<ReturnType<F>, Rest>
    : V
type PipeResult<V, S extends readonly PipeStep[]> =
  IsAny<V> extends true
    ? any
    : | PipeImmediate<Exclude<V, PromiseLike<unknown>>, S>
      | ([Extract<V, PromiseLike<unknown>>] extends [never] ? never : Promise<Awaited<PipeResult<Awaited<Extract<V, PromiseLike<unknown>>>, S>>>)

/** Apply heterogeneous steps until one returns an Error. */
export declare function pipe<V>(initial: V): PipeResult<V, []>
export declare function pipe<V, R1>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
): PipeResult<V, [(value: Exclude<Awaited<V>, Error>) => R1]>
export declare function pipe<V, R1, R2>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
): PipeResult<V, [(value: Exclude<Awaited<V>, Error>) => R1, (value: Exclude<Awaited<R1>, Error>) => R2]>
export declare function pipe<V, R1, R2, R3>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
): PipeResult<V, [(value: Exclude<Awaited<V>, Error>) => R1, (value: Exclude<Awaited<R1>, Error>) => R2, (value: Exclude<Awaited<R2>, Error>) => R3]>
export declare function pipe<V, R1, R2, R3, R4>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5, R6>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
  step6: (value: Exclude<Awaited<R5>, Error>) => R6,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
    (value: Exclude<Awaited<R5>, Error>) => R6,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5, R6, R7>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
  step6: (value: Exclude<Awaited<R5>, Error>) => R6,
  step7: (value: Exclude<Awaited<R6>, Error>) => R7,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
    (value: Exclude<Awaited<R5>, Error>) => R6,
    (value: Exclude<Awaited<R6>, Error>) => R7,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5, R6, R7, R8>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
  step6: (value: Exclude<Awaited<R5>, Error>) => R6,
  step7: (value: Exclude<Awaited<R6>, Error>) => R7,
  step8: (value: Exclude<Awaited<R7>, Error>) => R8,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
    (value: Exclude<Awaited<R5>, Error>) => R6,
    (value: Exclude<Awaited<R6>, Error>) => R7,
    (value: Exclude<Awaited<R7>, Error>) => R8,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
  step6: (value: Exclude<Awaited<R5>, Error>) => R6,
  step7: (value: Exclude<Awaited<R6>, Error>) => R7,
  step8: (value: Exclude<Awaited<R7>, Error>) => R8,
  step9: (value: Exclude<Awaited<R8>, Error>) => R9,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
    (value: Exclude<Awaited<R5>, Error>) => R6,
    (value: Exclude<Awaited<R6>, Error>) => R7,
    (value: Exclude<Awaited<R7>, Error>) => R8,
    (value: Exclude<Awaited<R8>, Error>) => R9,
  ]
>
export declare function pipe<V, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
  initial: V,
  step1: (value: Exclude<Awaited<V>, Error>) => R1,
  step2: (value: Exclude<Awaited<R1>, Error>) => R2,
  step3: (value: Exclude<Awaited<R2>, Error>) => R3,
  step4: (value: Exclude<Awaited<R3>, Error>) => R4,
  step5: (value: Exclude<Awaited<R4>, Error>) => R5,
  step6: (value: Exclude<Awaited<R5>, Error>) => R6,
  step7: (value: Exclude<Awaited<R6>, Error>) => R7,
  step8: (value: Exclude<Awaited<R7>, Error>) => R8,
  step9: (value: Exclude<Awaited<R8>, Error>) => R9,
  step10: (value: Exclude<Awaited<R9>, Error>) => R10,
): PipeResult<
  V,
  [
    (value: Exclude<Awaited<V>, Error>) => R1,
    (value: Exclude<Awaited<R1>, Error>) => R2,
    (value: Exclude<Awaited<R2>, Error>) => R3,
    (value: Exclude<Awaited<R3>, Error>) => R4,
    (value: Exclude<Awaited<R4>, Error>) => R5,
    (value: Exclude<Awaited<R5>, Error>) => R6,
    (value: Exclude<Awaited<R6>, Error>) => R7,
    (value: Exclude<Awaited<R7>, Error>) => R8,
    (value: Exclude<Awaited<R8>, Error>) => R9,
    (value: Exclude<Awaited<R9>, Error>) => R10,
  ]
>
/** Annotated fallback for pipelines longer than ten steps. */
export declare function pipe<V, const S extends readonly PipeStep[]>(initial: V, ...steps: S & PipeArgs<V, S>): PipeResult<V, S>

type Outcome<T> = { readonly success: true; readonly data: Exclude<T, Error> } | { readonly success: false; readonly error: ErrorMember<T> }

/** Classify an immediate value as success or failure. */
export declare function result<T>(value: T): Outcome<T>

/** Return fallback for an immediate Error, otherwise return the value. */
export declare function or<T, F>(value: T, fallback: F): Exclude<T, Error> | F

/** Throw an immediate Error unchanged, otherwise return the value. */
export declare function or_throw<T>(value: T): Exclude<T, Error>
