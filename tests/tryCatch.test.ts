import { test } from '@japa/runner'
import { Err } from '../src/Err.js'
import { make, tryCatch } from '../src/index.js'

test.group('tryCatch', () => {
  test('it handles non-error results', async ({ expect }) => {
    const getFoo = () => 'foo'
    const add = (x: number, y: number) => x + y
    const asyncAdd = async (x: number, y: number) => x + y
    const handler = (err: unknown) => make('X', {})
    expect(tryCatch(getFoo, handler)).toBe('foo')
    expect(tryCatch(() => add(1, 1), handler)).toBe(2)
    expect(await tryCatch(() => asyncAdd(1, 2), handler)).toBe(3)
  })

  test('it handles sync errors', async ({ expect }) => {
    const error = new Error('Something went wrong')
    const handler = (err: unknown) => make('X', {})
    const res = tryCatch(() => {
      throw error
    }, handler)
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('X')
  })

  test('it handles async errors', async ({ expect }) => {
    const error = new Error('Something went wrong async')
    const handler = (err: unknown) => make('X', {})
    const res = await tryCatch(() => Promise.reject(error), handler)
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('X')
  })

  test(`it's typed`, async ({ expectTypeOf }) => {
    expectTypeOf(
      tryCatch(
        () => 1,
        (err) => make('X', {}),
      ),
    ).toEqualTypeOf<number | Err<'X'>>()
    expectTypeOf(
      await tryCatch(
        async () => '...',
        (err) => make('X', {}),
      ),
    ).toMatchTypeOf<string | Err<'X'>>()
  })
})
