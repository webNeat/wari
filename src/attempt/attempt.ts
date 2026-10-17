import { capture } from '../internal/capture.js'

type Captured<Value, Mapped extends Error> = Mapped | (Value extends PromiseLike<unknown> ? Promise<Awaited<Value> | Mapped> : Value)

/** Run a function and map thrown or rejected values to an Error. */
export function attempt<Value, Mapped extends Error>(fn: () => Value, mapper: (cause: unknown) => Mapped): Captured<Value, Mapped> {
  let value: Value
  try {
    value = fn()
  } catch (cause) {
    return mapper(cause) as Captured<Value, Mapped>
  }
  return capture(value, mapper) as Captured<Value, Mapped>
}
