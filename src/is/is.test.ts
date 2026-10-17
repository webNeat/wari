import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { is } from './is.js'

class Base {
  base = true
}
class Child extends Base {
  child = true
}
class Other {
  other = true
}
abstract class AbstractBase {
  abstract value: string
}
class Concrete extends AbstractBase {
  value = 'ok'
}

test('types', () => {
  expectTypeOf(is).toBeFunction()
  expectTypeOf(is<typeof Base>).parameters.toEqualTypeOf<[SomeClass: typeof Base, value: unknown]>()
  expectTypeOf(is<typeof Base>).returns.toEqualTypeOf<boolean>()

  const child: unknown = new Child()
  if (is(Base, child)) {
    expectTypeOf(child).toEqualTypeOf<Base>()
  }

  const concrete: unknown = new Concrete()
  if (is(AbstractBase, concrete)) {
    expectTypeOf(concrete).toEqualTypeOf<AbstractBase>()
  }

  expect(() => {
    // @ts-expect-error requires a class constructor
    is({}, child)
  }).toThrow(TypeError)
})

it('uses ordinary instanceof behavior', () => {
  expect(is(Base, new Child())).toBe(true)
  expect(is(Child, new Base())).toBe(false)
  expect(is(Other, new Base())).toBe(false)
  expect(is(Date, new Date())).toBe(true)
  expect(is(Date, {})).toBe(false)
  expect(is(String, 'text')).toBe(false)
  expect(is(Object, null)).toBe(false)
  expect(is(Object, undefined)).toBe(false)
})

it('honors Symbol.hasInstance and propagates its errors', () => {
  class Anything {
    static [Symbol.hasInstance](value: unknown) {
      return value === 'accepted'
    }
  }
  expect(is(Anything, 'accepted')).toBe(true)
  expect(is(Anything, 'rejected')).toBe(false)

  const failure = new Error('hasInstance failed')
  class Broken {
    static [Symbol.hasInstance]() {
      throw failure
    }
  }
  expect(() => is(Broken, {})).toThrow(failure)
})
