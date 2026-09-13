import { capture } from '../internal/capture.js'

type Success<Value> = Exclude<Awaited<Value>, Error>
type Failure<Value> = Extract<Awaited<Value>, Error>
type StepOutputs<Steps extends readonly unknown[]> = {
  [Index in keyof Steps]: Steps[Index] extends (...args: any[]) => any ? ReturnType<Steps[Index]> : never
}
type SyncOutput<Initial, Last, Steps extends readonly unknown[]> =
  | Success<Exclude<Last, PromiseLike<unknown>>>
  | Failure<Exclude<Initial, PromiseLike<unknown>>>
  | Failure<Exclude<Steps[number], PromiseLike<unknown>>>
type AsyncOutput<Initial, Last, Steps extends readonly unknown[]> = Success<Last> | Failure<Initial> | Failure<Steps[number]>
type Output<Initial, Last, Steps extends readonly unknown[]> = [Extract<Initial | Steps[number], PromiseLike<unknown>>] extends [never]
  ? AsyncOutput<Initial, Last, Steps>
  : [Exclude<Initial, PromiseLike<unknown>>] extends [never]
    ? Promise<AsyncOutput<Initial, Last, Steps>>
    : SyncOutput<Initial, Last, Steps> | Promise<AsyncOutput<Initial, Last, Steps>>
type Step<Previous, Next> = (value: Success<Previous>) => Next
type ValidSteps<Previous, Steps extends readonly ((value: any) => any)[]> = Steps extends readonly [
  infer First,
  ...infer Rest extends ((value: any) => any)[],
]
  ? First extends (value: any) => any
    ? [Success<Previous>] extends [Parameters<First>[0]]
      ? ValidSteps<ReturnType<First>, Rest>
      : never
    : never
  : unknown

type FallbackOutput<Initial, Steps extends readonly ((value: any) => any)[]> = Steps extends readonly [...unknown[], infer Last]
  ? Last extends (value: any) => any
    ? Output<Initial, ReturnType<Last>, StepOutputs<Steps>>
    : Output<Initial, Initial, StepOutputs<Steps>>
  : Output<Initial, Initial, StepOutputs<Steps>>

export function pipe<Initial, First>(initial: Initial, first: Step<Initial, First>): Output<Initial, First, readonly [First]>
export function pipe<Initial, First, Second>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
): Output<Initial, Second, readonly [First, Second]>
export function pipe<Initial, First, Second, Third>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
): Output<Initial, Third, readonly [First, Second, Third]>
export function pipe<Initial, First, Second, Third, Fourth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
): Output<Initial, Fourth, readonly [First, Second, Third, Fourth]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
): Output<Initial, Fifth, readonly [First, Second, Third, Fourth, Fifth]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
  sixth: Step<Fifth, Sixth>,
): Output<Initial, Sixth, readonly [First, Second, Third, Fourth, Fifth, Sixth]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
  sixth: Step<Fifth, Sixth>,
  seventh: Step<Sixth, Seventh>,
): Output<Initial, Seventh, readonly [First, Second, Third, Fourth, Fifth, Sixth, Seventh]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
  sixth: Step<Fifth, Sixth>,
  seventh: Step<Sixth, Seventh>,
  eighth: Step<Seventh, Eighth>,
): Output<Initial, Eighth, readonly [First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
  sixth: Step<Fifth, Sixth>,
  seventh: Step<Sixth, Seventh>,
  eighth: Step<Seventh, Eighth>,
  ninth: Step<Eighth, Ninth>,
): Output<Initial, Ninth, readonly [First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth]>
export function pipe<Initial, First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth, Tenth>(
  initial: Initial,
  first: Step<Initial, First>,
  second: Step<First, Second>,
  third: Step<Second, Third>,
  fourth: Step<Third, Fourth>,
  fifth: Step<Fourth, Fifth>,
  sixth: Step<Fifth, Sixth>,
  seventh: Step<Sixth, Seventh>,
  eighth: Step<Seventh, Eighth>,
  ninth: Step<Eighth, Ninth>,
  tenth: Step<Ninth, Tenth>,
): Output<Initial, Tenth, readonly [First, Second, Third, Fourth, Fifth, Sixth, Seventh, Eighth, Ninth, Tenth]>
export function pipe<Initial, Steps extends readonly ((value: any) => any)[]>(
  initial: Initial,
  ...steps: Steps & ValidSteps<Initial, Steps>
): FallbackOutput<Initial, Steps>
export function pipe(initial: unknown, ...steps: ((value: any) => any)[]): unknown {
  const fail = (cause: unknown) => {
    if (cause instanceof Error) return cause
    const error = new Error('Pipeline failed')
    error.cause = cause
    return error
  }

  const run = (start: number, input: unknown): unknown => {
    let value = input
    for (let index = start; ; index++) {
      if (value instanceof Error) return value
      const captured = capture(value, fail)
      if (captured instanceof Promise) return captured.then((resolved) => run(index, resolved), fail)
      if (captured instanceof Error) return captured
      value = captured
      if (index === steps.length) return value
      try {
        value = steps[index]!(value)
      } catch (cause) {
        return fail(cause)
      }
    }
  }

  return run(0, initial)
}
