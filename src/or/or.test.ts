import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { or } from './or.js'

test('types', () => {
  expectTypeOf(or).toBeFunction()
  expectTypeOf(or<string | TypeError, number>).parameters.toEqualTypeOf<[value: string | TypeError, fallback: number]>()
  expectTypeOf(or<string | TypeError, number>).returns.toEqualTypeOf<string | number>()
  expectTypeOf(or).parameters.toEqualTypeOf<[value: unknown, fallback: unknown]>()
  expectTypeOf(or).returns.toEqualTypeOf<unknown>()
  expectTypeOf(or<Error, string>).returns.toEqualTypeOf<string>()
})

it('returns non-Errors unchanged and uses the fallback for Errors', () => {
  const value = { ok: true }
  expect(or(value, 'fallback')).toBe(value)
  expect(or(new TypeError('failed'), 'fallback')).toBe('fallback')
})

it('treats function fallbacks and promises as ordinary values', () => {
  const fallback = () => 'fallback'
  expect(or(new Error('failed'), fallback)).toBe(fallback)

  const value = Promise.resolve(new Error('inside'))
  expect(or(value, 'fallback')).toBe(value)
})
