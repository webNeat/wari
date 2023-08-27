import { test } from '@japa/runner'
import { make, match } from '../src/functions.js'
import { Err } from '../src/Err.js'

test.group('match', () => {
  test('it returns the non-error value', ({ expect }) => {
    const fn = (): number | Err<'JsonError'> | Err<'HttpError'> => 1
    const res = match(fn(), {
      HttpError: console.error,
      JsonError: console.error,
    })
    expect(res).toBe(1)
  })

  test('it returns the error handler return if error is matched', ({ expect }) => {
    const fn = (): number | Err<'JsonError'> | Err<'HttpError'> => make('JsonError', { text: '' })
    const res = match(fn(), {
      HttpError: () => 100,
      JsonError: () => 200,
    })
    expect(res).toBe(200)
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    const foo = (): Err<'JsonError'> | Err<'HttpError'> => make('JsonError', { text: '' })
    const bar = (): number | Err<'JsonError'> | Err<'HttpError'> => 1
    const baz = (): number => 2

    expectTypeOf(
      match(foo(), {
        HttpError: () => {},
        JsonError: () => {},
      }),
    ).toBeUndefined()

    expectTypeOf(
      match(foo(), {
        HttpError: () => 1,
        JsonError: () => 'Oups!',
      }),
    ).toEqualTypeOf<number | string>()

    expectTypeOf(
      match(bar(), {
        HttpError: () => {},
        JsonError: () => {},
      }),
    ).toEqualTypeOf<number | undefined>()

    expectTypeOf(
      match(bar(), {
        HttpError: () => {},
        JsonError: () => 'Oups',
      }),
    ).toEqualTypeOf<string | number | undefined>()

    expectTypeOf(match(baz(), {} as never)).toBeNumber()
  })
})
