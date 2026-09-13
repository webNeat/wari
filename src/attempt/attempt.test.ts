import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { attempt } from './attempt.js'

test('types', () => {
  const sync = attempt(
    () => 'value',
    () => new TypeError('mapped'),
  )
  expectTypeOf(sync).toEqualTypeOf<string | TypeError>()
  const mapped = attempt(
    () => 1,
    () => new TypeError('mapped'),
  )
  expectTypeOf(mapped).toEqualTypeOf<number | TypeError>()
  const asyncError = attempt(
    () => Promise.resolve(new Error('value')),
    () => new TypeError('mapped'),
  )
  expectTypeOf(asyncError).toEqualTypeOf<TypeError | Promise<Error | TypeError>>()
  const neverMapped = attempt(
    () => 'value',
    () => {
      throw new Error('unreachable')
    },
  )
  expectTypeOf(neverMapped).toEqualTypeOf<string>()
})

it('returns values and returned Errors unchanged', () => {
  const error = new Error('returned')
  expect(
    attempt(
      () => 3,
      () => new Error(),
    ),
  ).toBe(3)
  expect(
    attempt(
      () => error,
      () => new Error(),
    ),
  ).toBe(error)
})

it('maps throws and promise-like rejections', async () => {
  const cause = { code: 1 }
  expect(
    attempt(
      () => {
        throw cause
      },
      (value) => new Error(String((value as typeof cause).code)),
    ),
  ).toMatchObject({ message: '1' })
  const outcome = attempt(
    () => Promise.reject(cause),
    (value) => new Error(String((value as typeof cause).code)),
  )
  await expect(outcome).resolves.toMatchObject({ message: '1' })
})

it('lets mapper exceptions escape', () => {
  const failure = new Error('mapper')
  expect(() =>
    attempt(
      () => {
        throw 'cause'
      },
      () => {
        throw failure
      },
    ),
  ).toThrow(failure)
})

it('assimilates custom thenables and maps mapper throws from rejections', async () => {
  const thenable = new Proxy(
    {},
    {
      get: (_target, key) => (key === 'then' ? (resolve: (value: string) => void) => resolve('value') : undefined),
    },
  ) as PromiseLike<string>
  await expect(
    attempt(
      () => thenable,
      () => new Error('mapped'),
    ),
  ).resolves.toBe('value')
  const failure = new Error('mapper')
  const outcome = attempt(
    () => Promise.reject('cause'),
    () => {
      throw failure
    },
  )
  await expect(outcome).rejects.toBe(failure)
})

it('captures throwing then accessors', () => {
  const failure = new Error('then')
  const value = new Proxy(
    {},
    {
      get: (_target, key) => {
        if (key === 'then') throw failure
      },
    },
  )
  expect(
    attempt(
      () => value,
      (cause) => cause as Error,
    ),
  ).toBe(failure)
})
