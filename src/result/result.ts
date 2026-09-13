type IsAny<Value> = 0 extends 1 & Value ? true : false
type ErrorMember<Value> =
  IsAny<Value> extends true
    ? Error
    : unknown extends Value
      ? Error
      : Value extends unknown
        ? Value extends Error
          ? Value
          : Error extends Value
            ? Error
            : never
        : never

export type Result<Value> =
  | { readonly success: true; readonly data: Exclude<Value, Error> }
  | { readonly success: false; readonly error: ErrorMember<Value> }

/** Convert an immediate value or Error to a discriminated result. */
export function result<Value>(value: Value): Result<Value> {
  if (value instanceof Error) return { success: false, error: value } as Result<Value>
  return { success: true, data: value as Exclude<Value, Error> }
}
