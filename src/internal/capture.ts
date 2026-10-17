export function capture<Value>(value: Value, map: (cause: unknown) => Error): Value | Error | Promise<Awaited<Value> | Error> {
  if (value instanceof Error) return value
  try {
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return value
    const then = (value as { then?: unknown }).then
    if (typeof then !== 'function') return value
    return new Promise((resolve, reject) => {
      Reflect.apply(then, value, [resolve, reject])
    }).then(
      (resolved) => resolved,
      (cause: unknown) => map(cause),
    ) as Promise<Awaited<Value> | Error>
  } catch (cause) {
    return map(cause)
  }
}
