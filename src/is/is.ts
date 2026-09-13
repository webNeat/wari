type AnyClass = abstract new (...args: never[]) => unknown
type Instance<C> = C extends abstract new (...args: never[]) => infer I ? I : never

/**
 * Check whether a value is an instance of a constructor.
 * Equivalent to `value instanceof SomeClass`
 */
export function is<Class extends AnyClass>(SomeClass: Class, value: unknown): value is Instance<Class> {
  return value instanceof SomeClass
}
