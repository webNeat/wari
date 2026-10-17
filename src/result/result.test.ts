import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { result } from './result.js'

test('types', () => {
  expectTypeOf(result<string | TypeError>).returns.toEqualTypeOf<
    { readonly success: true; readonly data: string } | { readonly success: false; readonly error: TypeError }
  >()
  expectTypeOf(result<object>).returns.toEqualTypeOf<
    { readonly success: true; readonly data: object } | { readonly success: false; readonly error: Error }
  >()
  expectTypeOf(result<{}>).returns.toEqualTypeOf<
    { readonly success: true; readonly data: {} } | { readonly success: false; readonly error: Error }
  >()
  expectTypeOf(result<unknown>).returns.toEqualTypeOf<
    { readonly success: true; readonly data: unknown } | { readonly success: false; readonly error: Error }
  >()
  expectTypeOf(result<any>).returns.toEqualTypeOf<
    { readonly success: true; readonly data: any } | { readonly success: false; readonly error: Error }
  >()
})

it('converts immediate values and Errors without inspecting promises', () => {
  expect(result('value')).toEqual({ success: true, data: 'value' })
  const error = new TypeError('failed')
  expect(result(error)).toEqual({ success: false, error })
  const promise = Promise.resolve(error)
  expect(result(promise)).toEqual({ success: true, data: promise })
})
