/**
 * Return a fallback when a value is an Error.
 */
export function or<Value, Fallback>(value: Value, fallback: Fallback): Exclude<Value, Error> | Fallback {
  if (value instanceof Error) return fallback
  return value as Exclude<Value, Error>
}
