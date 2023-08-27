import { test } from '@japa/runner'
import { Err } from '../src/Err.js'
import { tryCatch } from '../src/index.js'

test.group('tryCatch', () => {
  test('it handles non-error results', async ({ expect }) => {
    const getFoo = () => 'foo'
    const add = (x: number, y: number) => x + y
    const asyncAdd = async (x: number, y: number) => x + y
    expect(tryCatch(getFoo)).toBe('foo')
    expect(tryCatch(add, 1, 1)).toBe(2)
    expect(await tryCatch(asyncAdd, 1, 2)).toBe(3)
  })

  test('it handles sync errors', async ({ expect }) => {
    const error = new Error('Something went wrong')
    const res = tryCatch(() => {
      throw error
    })
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toBe(error)
  })

  test('it handles async errors', async ({ expect }) => {
    const error = new Error('Something went wrong async')
    const res = await tryCatch(() => Promise.reject(error))
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toBe(error)
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    expectTypeOf(tryCatch).toMatchTypeOf<(fn: () => number) => number | Err<'Unknown'>>()
    expectTypeOf(tryCatch).toMatchTypeOf<(fn: () => Promise<string>) => Promise<string | Err<'Unknown'>>>()
  })
})
