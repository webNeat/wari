/**
 * Return a value, or throw it when it is an Error.
 */
export function or_throw<Value>(value: Value): Exclude<Value, Error> {
  if (value instanceof Error) throw value
  return value as Exclude<Value, Error>
}
