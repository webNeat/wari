import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { or_throw } from './or_throw.js'

test('types', () => {
  expectTypeOf(or_throw).toBeFunction()
  expectTypeOf(or_throw<string | TypeError>).parameters.toEqualTypeOf<[value: string | TypeError]>()
  expectTypeOf(or_throw<string | TypeError>).returns.toEqualTypeOf<string>()
  expectTypeOf(or_throw).parameter(0).toEqualTypeOf<unknown>()
  expectTypeOf(or_throw).returns.toEqualTypeOf<unknown>()
  expectTypeOf(or_throw<Error>).returns.toEqualTypeOf<never>()
})

it('returns non-Errors unchanged', () => {
  const value = { ok: true }
  expect(or_throw(value)).toBe(value)
  expect(or_throw(3)).toBe(3)
})

it('throws the same Error instance', () => {
  const failure = new TypeError('failed')
  expect.assertions(1)
  try {
    or_throw(failure)
  } catch (error) {
    expect(error).toBe(failure)
  }
})

it('treats promises as ordinary values', () => {
  const value = Promise.resolve(new Error('inside'))
  expect(or_throw(value)).toBe(value)
})
