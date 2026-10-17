import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { pipe } from './pipe.js'

test('types', () => {
  const output = pipe(
    1,
    (value) => value + 1,
    (value) => String(value),
    (value) => value.length,
  )
  expectTypeOf(output).toEqualTypeOf<number>()
  const ten = pipe(
    1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
    (v) => v + 1,
  )
  expectTypeOf(ten).toEqualTypeOf<number>()
  const longer = pipe(
    1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
    (v: number) => v + 1,
  )
  expectTypeOf(longer).toEqualTypeOf<number>()
  const awaitedFailure = pipe(Promise.resolve(new TypeError('initial')), (value: number) => value + 1)
  expectTypeOf(awaitedFailure).toEqualTypeOf<Promise<TypeError | number>>()
  const initialUnion = pipe(null as unknown as Error | Promise<number>, (value: number) => value + 1)
  // @ts-expect-error an Error initial value can return synchronously
  expectTypeOf(initialUnion).toHaveProperty('then')
  const mixedStep = pipe(1, (value) => (value > 0 ? new RangeError('sync') : Promise.resolve(value)))
  expectTypeOf(mixedStep).toEqualTypeOf<RangeError | Promise<RangeError | number>>()
  const fallback = pipe(
    1,
    (value: number) => (value > 0 ? new RangeError('middle') : value),
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => value + 1,
    (value: number) => Promise.resolve(value + 1),
  )
  // @ts-expect-error an intermediate Error can return synchronously
  expectTypeOf(fallback).toHaveProperty('then')
  pipe(
    1,
    // @ts-expect-error the second callback cannot accept the first callback's output
    (value: number) => String(value),
    (value: number) => value + 1,
  )
})

it('pipes synchronous values and stops on returned Errors', () => {
  expect(
    pipe(
      0,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
      (v) => v + 1,
    ),
  ).toBe(10)
  expect(
    pipe(
      2,
      (value) => value + 1,
      (value) => String(value),
    ),
  ).toBe('3')
  const error = new TypeError('stop')
  // oxlint-disable-next-line unicorn/no-thenable -- Test Error short-circuiting before promise detection.
  Object.defineProperty(error, 'then', {
    get: () => {
      throw new Error('must not inspect then')
    },
  })
  expect(pipe(error, () => 'unreachable')).toBe(error)
  const getterError = new RangeError('then getter failed')
  let called = false
  // oxlint-disable-next-line unicorn/no-thenable -- Test a throwing promise-like accessor.
  const thenable = Object.defineProperty({}, 'then', {
    get: () => {
      throw getterError
    },
  })
  expect(
    pipe(thenable, () => {
      called = true
      return 'unreachable'
    }),
  ).toBe(getterError)
  expect(called).toBe(false)
  expect(
    pipe(
      2,
      () => error,
      () => 'unreachable',
    ),
  ).toBe(error)
})

it('awaits promise-like values and captures throws and rejections', async () => {
  await expect(
    pipe(
      Promise.resolve(2),
      (value) => value + 1,
      (value) => Promise.resolve(String(value)),
    ),
  ).resolves.toBe('3')
  const reason = { code: 8 }
  const rejected = pipe(Promise.reject(reason), (value: number) => value + 1) as unknown as Promise<Error>
  await expect(rejected).resolves.toMatchObject({ message: 'Pipeline failed', cause: reason })
  const thrown = pipe(1, () => {
    throw reason
  }) as unknown as Error
  expect(thrown.cause).toBe(reason)
  const rejectedError = new Error('rejected')
  await expect(pipe(Promise.reject(rejectedError), (value: number) => value)).resolves.toBe(rejectedError)
  const returnedError = new TypeError('returned asynchronously')
  await expect(
    pipe(
      Promise.resolve(1),
      () => Promise.resolve(returnedError),
      () => 'unreachable',
    ),
  ).resolves.toBe(returnedError)
  await expect(pipe(Promise.resolve(1))).resolves.toBe(1)
  const asyncThrow = pipe(Promise.resolve(1), () => {
    throw reason
  }) as unknown as Promise<Error>
  await expect(asyncThrow).resolves.toMatchObject({ cause: reason })
})
