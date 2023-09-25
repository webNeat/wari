import { test } from '@japa/runner'
import { Err } from '../src/Err.js'
import { make, safe } from '../src/index.js'

test.group('safe', () => {
  test('it handles non-error results', async ({ expect }) => {
    const handler = (err: unknown, args: any[]) => make('X', {})
    const getFoo = safe(() => 'foo', handler)
    const add = safe((x: number, y: number) => x + y, handler)
    const asyncAdd = safe(async (x: number, y: number) => x + y, handler)
    expect(getFoo()).toBe('foo')
    expect(add(1, 1)).toBe(2)
    expect(await asyncAdd(1, 2)).toBe(3)
  })

  test('it handles sync errors', async ({ expect }) => {
    const error = new Error('Something went wrong')
    const handler = (err: unknown, args: any[]) => make('Unknown', {error: {err, args}})
    const fn = safe((x: number) => {
      if (x === 42) return true
      throw error
    }, handler)
    expect(fn(42)).toBe(true)

    const res = fn(1) as Err
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toEqual({err: error, args: [1]})
  })

  test('it handles async errors', async ({ expect }) => {
    const error = new Error('Something went wrong')
    const handler = (err: unknown, args: any[]) => make('Unknown', {error: {err, args}})
    const fn = safe(async (x: number) => {
      if (x === 42) return true
      throw error
    }, handler)
    expect(await fn(42)).toBe(true)

    const res = await fn(1) as Err
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toEqual({err: error, args: [1]})
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    expectTypeOf(safe).toMatchTypeOf<(fn: (x: number, y: string) => number, handler: (err: unknown, args: [number, string]) => Err<'X'>) => (x: number, y: string) => number | Err<'X'>>()
    expectTypeOf(safe).toMatchTypeOf<(fn: () => Promise<string>, handler: (err: unknown, args: []) => Err<'X'>) => () => Promise<string | Err<'X'>>>()
  })
})
