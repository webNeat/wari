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
    const handler = (err: unknown, args: any[]) => make('Unknown', { error: { err, args } })
    const fn = safe((x: number) => {
      if (x === 42) return true
      throw error
    }, handler)
    expect(fn(42)).toBe(true)

    const res = fn(1) as Err
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toEqual({ err: error, args: [1] })
  })

  test('it handles async errors', async ({ expect }) => {
    const error = new Error('Something went wrong')
    const handler = (err: unknown, args: any[]) => make('Unknown', { error: { err, args } })
    const fn = safe(async (x: number) => {
      if (x === 42) return true
      throw error
    }, handler)
    expect(await fn(42)).toBe(true)

    const res = (await fn(1)) as Err
    expect(res).toBeInstanceOf(Err)
    expect(res.type).toBe('Unknown')
    expect(res.details.error).toEqual({ err: error, args: [1] })
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    const fn_no_return = safe(
      () => {},
      () => 10,
    )
    expectTypeOf(fn_no_return).toMatchTypeOf<() => void | number>()

    const fn_default_return = safe(
      (text: string) => text,
      () => 'default',
    )
    expectTypeOf(fn_default_return).toMatchTypeOf<(text: string) => string>()

    const fn_sync_error = safe(
      (text: string) => text,
      () => make('X', {}),
    )
    expectTypeOf(fn_sync_error).toMatchTypeOf<(text: string) => string | Err<'X'>>()

    const fn_sync_many_errors = safe(
      (text: string) => text,
      (err, [text]) => {
        if (text.length < 5) return make('X', {})
        return make('Y', {})
      },
    )
    expectTypeOf(fn_sync_many_errors).toMatchTypeOf<(text: string) => string | Err<'X'> | Err<'Y'>>()

    const fn_async_default_return = safe(
      async (text: string) => text,
      (err, args) => 'default',
    )
    expectTypeOf(fn_async_default_return).toMatchTypeOf<(text: string) => Promise<string>>()

    const fn_async_error = safe(
      async (text: string) => text,
      (err, args) => make('X', {}),
    )
    expectTypeOf(fn_async_error).toMatchTypeOf<(text: string) => Promise<string | Err<'X'>>>()

    const fn_async_many_errors = safe(
      async (text: string) => text,
      (err, [text]) => {
        if (text.length < 5) return make('X', {})
        return make('Y', {})
      },
    )
    expectTypeOf(fn_async_many_errors).toMatchTypeOf<(text: string) => Promise<string | Err<'X'> | Err<'Y'>>>()

    const fn_always_throws = safe(
      (text: string) => {
        throw 'Ooops!'
      },
      (err, args) => 'default',
    )
    expectTypeOf(fn_always_throws).toEqualTypeOf<(text: string) => string>()
  })
})
