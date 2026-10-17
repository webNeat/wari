import { capture } from '../internal/capture.js'

type Captured<Value, Mapped extends Error> = Mapped | (Value extends PromiseLike<unknown> ? Promise<Awaited<Value> | Mapped> : Value)

/** Wrap a function and map its thrown or rejected values to an Error. */
export function safe<This, Args extends unknown[], Value, Mapped extends Error>(
  fn: (this: This, ...args: Args) => Value,
  mapper: (cause: unknown, args: Args) => Mapped,
): (this: This, ...args: Args) => Captured<Value, Mapped> {
  return function (this: This, ...args: Args) {
    let value: Value
    try {
      value = fn.apply(this, args)
    } catch (cause) {
      return mapper(cause, args) as Captured<Value, Mapped>
    }
    return capture(value, (cause) => mapper(cause, args)) as Captured<Value, Mapped>
  }
}
