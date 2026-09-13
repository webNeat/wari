type Constructor<Instance> = abstract new (...args: never[]) => Instance
type Case = { on: Constructor<unknown>; do: (value: never) => unknown }

/** Run the first matching constructor case, or return the original value. */
export function match<Value, Instances extends unknown[] = [], Results extends unknown[] = []>(
  value: Value,
  ...cases: { [Index in keyof Instances]: { on: Constructor<Instances[Index]>; do: (value: Instances[Index]) => unknown } } & {
    [Index in keyof Results]: { do: (value: never) => Results[Index] }
  }
): Results[number] | Exclude<Value, Instances[number]>
export function match(value: unknown, ...cases: Case[]): unknown {
  for (const item of cases) if (value instanceof item.on) return item.do(value as never)
  return value
}
