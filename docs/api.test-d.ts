import { pipe, result } from './api.ts'

// These are prototype regression tests, NOT passing contextual-inference acceptance.
// Expected failures below deliberately record the unresolved inference requirement.
type IsAny<T> = 0 extends 1 & T ? true : false
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Exact<A, B> = IsAny<A> extends true ? false : Equal<A, B>
type Assert<T extends true> = T
declare function exact<A, B>(...failure: Exact<A, B> extends true ? [] : [never]): void
// Guard the assertion helper itself against false inference successes.
type RejectAny = Assert<Equal<Exact<any, number>, false>>
type RejectUnknown = Assert<Equal<Exact<unknown, number>, false>>
type RejectNever = Assert<Equal<Exact<never, number>, false>>

type ResultFor<Value> =
  | { readonly success: true; readonly data: Exclude<Value, Error> }
  | { readonly success: false; readonly error: Error extends Value ? Error : Extract<Value, Error> }
type ObjectResult = Assert<Exact<ReturnType<typeof result<object>>, ResultFor<object>>>
type EmptyObjectResult = Assert<Exact<ReturnType<typeof result<{}>>, ResultFor<{}>>>
type UnknownResult = Assert<Exact<ReturnType<typeof result<unknown>>, ResultFor<unknown>>>
type AnyResult = Assert<Exact<ReturnType<typeof result<any>>, ResultFor<any>>>

type E<N extends number> = Error & { readonly stage: N }
declare const fail: boolean
declare const errors: { [N in 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12]: E<N> }
declare const initial: number | E<0>

// Twelve heterogeneous steps. Annotations are required by the current prototype.
const long = pipe(
  initial,
  (x: number) => {
    exact<typeof x, number>()
    // @ts-expect-error number does not expose string methods
    x.toUpperCase()
    return fail ? errors[1] : String(x)
  },
  (x: string) => {
    exact<typeof x, string>()
    // @ts-expect-error string does not expose number methods
    x.toFixed()
    return fail ? errors[2] : { text: x }
  },
  (x: { text: string }) => {
    exact<typeof x, { text: string }>()
    // @ts-expect-error errors are excluded from the input
    x.stage
    return fail ? errors[3] : x.text.length > 0
  },
  (x: boolean) => {
    exact<typeof x, boolean>()
    return fail ? errors[4] : [x]
  },
  (x: boolean[]) => {
    exact<typeof x, boolean[]>()
    return fail ? errors[5] : { count: x.length }
  },
  (x: { count: number }) => {
    exact<typeof x, { count: number }>()
    return fail ? errors[6] : BigInt(x.count)
  },
  (x: bigint) => {
    exact<typeof x, bigint>()
    return fail ? errors[7] : { big: x }
  },
  (x: { big: bigint }) => {
    exact<typeof x, { big: bigint }>()
    return fail ? errors[8] : String(x.big)
  },
  (x: string) => {
    exact<typeof x, string>()
    return fail ? errors[9] : { parts: x.split('') }
  },
  (x: { parts: string[] }) => {
    exact<typeof x, { parts: string[] }>()
    return fail ? errors[10] : x.parts.length
  },
  (x: number) => {
    exact<typeof x, number>()
    return fail ? errors[11] : { final: x }
  },
  (x: { final: number }) => {
    exact<typeof x, { final: number }>()
    return fail ? errors[12] : String(x.final)
  },
)
type EachError = { [N in keyof typeof errors]: (typeof errors)[N] }[keyof typeof errors]
type LongResult = Assert<Exact<typeof long, string | EachError>>

// Ten unannotated callbacks infer sequentially, including a promise boundary.
const inferredTen = pipe(
  initial,
  (x) => {
    exact<typeof x, number>()
    // @ts-expect-error the initial Error is excluded
    x.stage
    return fail ? errors[1] : String(x)
  },
  (x) => {
    exact<typeof x, string>()
    // @ts-expect-error string does not expose number methods
    x.toFixed()
    return fail ? errors[2] : Promise.resolve({ value: x.length })
  },
  (x) => {
    exact<typeof x, { value: number }>()
    // @ts-expect-error no Error reaches the callback
    x.stage
    return fail ? errors[3] : x.value > 0
  },
  (x) => {
    exact<typeof x, boolean>()
    return fail ? errors[4] : x ? 1 : 0
  },
  (x) => {
    exact<typeof x, 0 | 1>()
    return fail ? errors[5] : { text: String(x) }
  },
  (x) => {
    exact<typeof x, { text: string }>()
    return fail ? errors[6] : BigInt(x.text.length)
  },
  (x) => {
    exact<typeof x, bigint>()
    return fail ? errors[7] : [String(x)]
  },
  (x) => {
    exact<typeof x, string[]>()
    return fail ? errors[8] : { count: x.length }
  },
  (x) => {
    exact<typeof x, { count: number }>()
    return fail ? errors[9] : Promise.resolve(String(x.count))
  },
  (x) => {
    exact<typeof x, string>()
    return fail ? errors[10] : x.length
  },
)
type InferredTenExpected = E<0> | E<1> | E<2> | Promise<number | E<3> | E<4> | E<5> | E<6> | E<7> | E<8> | E<9> | E<10>>
type InferredTenResult = Assert<Exact<typeof inferredTen, InferredTenExpected>>

// Promise boundaries preserve immediate errors before the first async step.
declare const asynchronousStep: (x: string) => PromiseLike<{ size: number } | E<2>>
const mixed = pipe(
  initial,
  (x: number) => (fail ? errors[1] : String(x)),
  asynchronousStep,
  (x: { size: number }) => {
    exact<typeof x, { size: number }>()
    // @ts-expect-error no promise reaches this callback
    x.then
    // @ts-expect-error no declared Error reaches this callback
    x.stage
    return fail ? errors[3] : x.size > 0
  },
)
type MixedResult = Assert<Exact<typeof mixed, E<0> | E<1> | Promise<boolean | E<2> | E<3>>>>

declare const asynchronousInput: PromiseLike<number | E<0>>
const asynchronous = pipe(
  asynchronousInput,
  (x: number) => (fail ? errors[1] : String(x)),
  asynchronousStep,
  (x: { size: number }) => (fail ? errors[3] : x.size > 0),
)
type AsyncResult = Assert<Exact<typeof asynchronous, Promise<boolean | E<0> | E<1> | E<2> | E<3>>>>

declare const maybeAsyncInput: number | E<0> | PromiseLike<number | E<1>>
const maybeAsync = pipe(maybeAsyncInput, (x: number) => (fail ? errors[2] : String(x)))
type MaybeAsyncResult = Assert<Exact<typeof maybeAsync, string | E<0> | E<2> | Promise<string | E<1> | E<2>>>>

declare const maybeAsyncStep: (x: number) => string | E<1> | PromiseLike<string | E<2>>
const maybeAsyncMiddle = pipe(initial, maybeAsyncStep, (x: string) => (fail ? errors[3] : x.length))
type MaybeAsyncMiddleResult = Assert<Exact<typeof maybeAsyncMiddle, number | E<0> | E<1> | E<3> | Promise<number | E<2> | E<3>>>>

// A definite error makes later declared returns unreachable.
const stops = pipe(
  1,
  (x: number) => errors[1],
  (x: never) => 'unreachable',
)
type StopsResult = Assert<Exact<typeof stops, E<1>>>
const startsStopped = pipe(errors[0], (x: never) => 'unreachable')
type StartsStoppedResult = Assert<Exact<typeof startsStopped, E<0>>>
const asyncStops = pipe(
  Promise.resolve(1),
  (x: number) => errors[1],
  (x: never) => 42,
)
type AsyncStopsResult = Assert<Exact<typeof asyncStops, Promise<E<1>>>>

// Functions are data on input and output, including after awaiting.
declare const fn: (x: number) => string
const emptyFn = pipe(fn)
type EmptyFn = Assert<Exact<typeof emptyFn, typeof fn>>
const returnedFn = pipe(1, (x: number) => fn)
type ReturnedFn = Assert<Exact<typeof returnedFn, typeof fn>>
const calledFn = pipe(fn, (x: typeof fn) => x(1))
type CalledFn = Assert<Exact<typeof calledFn, string>>
const asyncFn = pipe(
  Promise.resolve(1),
  (x: number) => fn,
  (x: typeof fn) => x(1),
)
type AsyncFn = Assert<Exact<typeof asyncFn, Promise<string>>>

const empty = pipe(initial)
type Empty = Assert<Exact<typeof empty, number | E<0>>>
const emptyAsync = pipe(asynchronousInput)
type EmptyAsync = Assert<Exact<typeof emptyAsync, Promise<number | E<0>>>>
const emptyMaybeAsync = pipe(maybeAsyncInput)
type EmptyMaybeAsync = Assert<Exact<typeof emptyMaybeAsync, number | E<0> | Promise<number | E<1>>>>

// Accepted boundary: actual captured exceptions are absent from declared results.
const captured = pipe(1, (x: number): string => {
  throw 'runtime Error, not string'
})
type CaptureBoundary = Assert<Exact<typeof captured, string>>

pipe(
  1,
  // @ts-expect-error a string-consuming step cannot follow a number result
  (x: number) => x + 1,
  (x: string) => x.length,
)
// @ts-expect-error a callback receives the awaited value, not a Promise
pipe(Promise.resolve(1), (x: Promise<number>) => x)
// @ts-expect-error initial errors are excluded from the callback input
pipe(initial, (x: E<0>) => x.stage)

// Fixed overloads guarantee unannotated inference through ten callbacks.
const inferredThree = pipe(
  1,
  (x) => x.toString(),
  (x) => x.length,
  (x) => x > 0,
)
type InferredThree = Assert<Exact<typeof inferredThree, boolean>>

// Isolate inference without Awaited, Error exclusion, or PipeResult.
type Fn = (x: never) => unknown
type Before<A, R extends readonly unknown[], K> = K extends '0' ? A : K extends keyof [A, ...R] ? [A, ...R][K] : never
type Steps<A, R extends readonly unknown[]> = { [K in keyof R]: (x: Before<A, R, K>) => R[K] }
type StepsNI<A, R extends readonly unknown[]> = { [K in keyof R]: (x: NoInfer<Before<A, R, K>>) => R[K] }
type Outputs<R extends readonly unknown[]> = { [K in keyof R]: (x: never) => R[K] }
type Inputs<A, R extends readonly unknown[]> = { [K in keyof R]: (x: Before<A, R, K>) => unknown }

declare function mapped<A, R extends [unknown, ...unknown[]]>(a: A, ...s: Steps<A, R>): R

// Return tuple inference succeeds even though contextual inputs after index 0 fail.
const independentReturns = mapped(
  1,
  (x) => {
    exact<typeof x, number>()
    // @ts-expect-error number does not have length
    x.length
    return 'str'
  },
  (x) => {
    exact<typeof x, unknown>()
    // @ts-expect-error required string input is NOT inferred
    exact<typeof x, string>()
    // @ts-expect-error unknown, not string
    x.length
    return true
  },
  (x) => {
    exact<typeof x, unknown>()
    // @ts-expect-error required boolean input is NOT inferred
    exact<typeof x, boolean>()
    return 42
  },
)
type IndependentReturns = Assert<Exact<typeof independentReturns, [string, boolean, number]>>

// An annotated first callback advances inference by one step, not the whole chain.
const partiallyAnnotated = mapped(
  1,
  (x: number) => x.toString(),
  (x) => {
    exact<typeof x, string>()
    // @ts-expect-error string does not expose number methods
    x.toFixed()
    return x.length
  },
  (x) => {
    exact<typeof x, unknown>()
    // @ts-expect-error the inferred second return does not contextually type the third
    exact<typeof x, number>()
    return true
  },
)
type PartiallyAnnotated = Assert<Exact<typeof partiallyAnnotated, [string, number, boolean]>>

// A parameterless first callback has the same effect as an annotated one.
mapped(
  1,
  () => 'str',
  (x) => {
    exact<typeof x, string>()
    return x.length
  },
  (x) => {
    exact<typeof x, unknown>()
    return true
  },
)

// NoInfer on predecessor references does not repair the dependency.
declare function mappedNI<A, R extends [unknown, ...unknown[]]>(a: A, ...s: StepsNI<A, R>): R
mappedNI(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Separate return inference from contextual inputs, plus a concrete first slot.
declare function intersect<A, R extends unknown[]>(a: A, ...s: Outputs<R> & Inputs<A, NoInfer<R>> & [(x: A) => unknown, ...unknown[]]): R
intersect(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Also infer the function tuple independently.
declare function separate<A, F extends Fn[], R extends unknown[]>(
  a: A,
  ...s: F & Outputs<R> & Inputs<A, NoInfer<R>> & [(x: A) => unknown, ...unknown[]]
): R
separate(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Separate head return parameter B; the dependent mapped tail still fails.
declare function head<A, B, R extends unknown[]>(a: A, first: (x: A) => B, ...s: Steps<B, R>): R
head(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Independently reverse-map predecessor and output tuples.
declare function dual<A, P extends unknown[], R extends [unknown, ...unknown[]]>(
  a: A,
  ...s: { [K in keyof P]: (x: P[K]) => unknown } & Outputs<R> & StepsNI<A, R>
): R
dual(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Recursive validation also failed as a standalone candidate: its rest reduced to [].

// Reverse-map the input tuple, with shifted output references instead.
type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never
type Next<T extends unknown[], K> = K extends keyof Tail<T> ? Tail<T>[K] : never
declare function shifted<A, T extends [A, ...unknown[]], Last>(a: A, ...s: { [K in keyof T]: (x: T[K]) => Next<[...T, Last], K> }): Last
shifted(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Tuple shape inference separated from return inference.
declare function shaped<A, Shape extends unknown[], R extends { [K in keyof Shape]: unknown }>(
  a: A,
  ...s: Shape & StepsNI<A, R> & [(x: A) => unknown, ...unknown[]]
): R
shaped(
  1,
  (x) => x.toString(),
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x.length,
  // @ts-expect-error this candidate leaves dependent inputs unknown
  (x) => x > 0,
)

// Fixed-length control, NOT an unbounded solution or a proposed public overload.
declare function bounded<A, B, C, D>(
  a: A,
  b: (a: Exclude<Awaited<A>, Error>) => B,
  c: (b: Exclude<Awaited<B>, Error>) => C,
  d: (c: Exclude<Awaited<C>, Error>) => D,
): D
const boundedControl = bounded(
  asynchronousInput,
  (x) => {
    exact<typeof x, number>()
    // @ts-expect-error number does not expose string methods
    x.toUpperCase()
    return fail ? errors[1] : Promise.resolve(String(x))
  },
  (x) => {
    exact<typeof x, string>()
    // @ts-expect-error no Error is passed through
    x.stage
    return fail ? errors[2] : { length: x.length }
  },
  (x) => {
    exact<typeof x, { length: number }>()
    // @ts-expect-error the preceding promise was awaited
    x.then
    return x.length > 0
  },
)
type BoundedControl = Assert<Exact<typeof boundedControl, boolean>>
