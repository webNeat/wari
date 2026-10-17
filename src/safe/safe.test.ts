import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { safe } from './safe.js'

test('types', () => {
  const wrapped = safe(
    (id: string, optional?: number) => id + optional,
    (_cause, args) => new Error(args[0]),
  )
  expectTypeOf(wrapped).parameters.toEqualTypeOf<[id: string, optional?: number]>()
  expectTypeOf(wrapped).returns.toEqualTypeOf<string | Error>()
  const rest = safe(
    (...values: [first: string, ...rest: number[]]) => values,
    (_cause, args) => new TypeError(args[0]),
  )
  expectTypeOf(rest).parameters.toEqualTypeOf<[first: string, ...rest: number[]]>()
  expectTypeOf(rest).returns.toEqualTypeOf<[first: string, ...rest: number[]] | TypeError>()
  const asyncWrapped = safe(
    (value: number) => Promise.resolve(value),
    () => new TypeError('mapped'),
  )
  expectTypeOf(asyncWrapped(1)).toEqualTypeOf<TypeError | Promise<number | TypeError>>()
  const neverMapped = safe(
    (value: string) => value,
    () => {
      throw new Error('unreachable')
    },
  )
  expectTypeOf(neverMapped('value')).toEqualTypeOf<string>()
  const receiver = safe(
    function (this: { readonly prefix: string }, id: string) {
      return this.prefix + id
    },
    () => new Error('mapped'),
  )
  expectTypeOf(receiver).parameters.toEqualTypeOf<[id: string]>()
  expectTypeOf(receiver).thisParameter.toEqualTypeOf<{ readonly prefix: string }>()
})

it('forwards receiver and original arguments', () => {
  const target = { prefix: 'item-' }
  const read = function (this: typeof target, id: string) {
    return this.prefix + id
  }
  const wrapped = safe(read, (_cause, args) => new Error(args[0]))
  expect(wrapped.call(target, '42')).toBe('item-42')
})

it('assimilates custom thenables and maps mapper throws from rejections', async () => {
  const thenable = new Proxy(
    {},
    {
      get: (_target, key) => (key === 'then' ? (resolve: (value: string) => void) => resolve('value') : undefined),
    },
  ) as PromiseLike<string>
  await expect(
    safe(
      () => thenable,
      () => new Error('mapped'),
    )(),
  ).resolves.toBe('value')
  const failure = new Error('mapper')
  const wrapped = safe(
    () => Promise.reject('cause'),
    () => {
      throw failure
    },
  )
  await expect(wrapped()).rejects.toBe(failure)
})

it('maps throws and rejections, but not returned Errors', async () => {
  const returned = new Error('returned')
  const wrapped = safe(
    (value: number) => {
      if (value === 1) throw 'bad'
      if (value === 2) return Promise.reject('bad')
      return returned
    },
    (_cause, args) => new Error(String(args[0])),
  )
  expect(wrapped(0)).toBe(returned)
  expect(wrapped(1)).toMatchObject({ message: '1' })
  await expect(wrapped(2)).resolves.toMatchObject({ message: '2' })
})
