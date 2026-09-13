import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { errors, is, match } from '../index.js'

const err = errors({ Missing: (details: { id: string }) => `Missing ${details.id}`, Offline: () => 'Offline' })

test('types', () => {
  const missing = err('Missing', { id: '42' })
  expectTypeOf(missing.name).toEqualTypeOf<'Missing'>()
  expectTypeOf(missing.details).toEqualTypeOf<{ id: string }>()
  expectTypeOf(new err.Offline()).toEqualTypeOf<InstanceType<typeof err.Offline>>()
  const unknown: unknown = missing
  if (is(err.Error, unknown)) {
    expectTypeOf(unknown).toEqualTypeOf<InstanceType<typeof err.Missing> | InstanceType<typeof err.Offline>>()
  }
  const message = match(missing, {
    on: err.Error,
    do: (error) => {
      expectTypeOf(error).toEqualTypeOf<InstanceType<typeof err.Missing> | InstanceType<typeof err.Offline>>()
      return error.message
    },
  })
  expectTypeOf(message).toEqualTypeOf<string>()
  expectTypeOf(err.Error).toMatchTypeOf<abstract new (...args: any[]) => InstanceType<typeof err.Missing> | InstanceType<typeof err.Offline>>()
  // @ts-expect-error error names are readonly
  missing.name = 'Other'
  // @ts-expect-error error details are readonly
  missing.details = { id: 'other' }
  expect(() => {
    // @ts-expect-error details are required for Missing
    err.Missing()
  }).toThrow(TypeError)
  expect(() => {
    // @ts-expect-error Offline does not accept details
    err.Offline('details')
  }).toThrow(TypeError)
  // @ts-expect-error optional details are not valid definitions
  errors({ Invalid: (_details?: string) => 'invalid' })
  // @ts-expect-error multiple details are not valid definitions
  errors({ Invalid: (_first: string, _second: string) => 'invalid' })
  // @ts-expect-error rest parameters are not valid definitions
  errors({ Invalid: (..._details: string[]) => 'invalid' })
  // @ts-expect-error static messages are not valid definitions
  errors({ Invalid: 'invalid' })
  // @ts-expect-error asynchronous messages are not valid definitions
  errors({ Invalid: async () => 'invalid' })
})

it('shares constructors and creates registry-specific Error bases', () => {
  const other = errors({ Missing: () => 'other' })
  const missing = err('Missing', { id: '42' })
  const alsoMissing = new err.Missing({ id: '42' })
  expect(missing).toBeInstanceOf(err.Missing)
  expect(alsoMissing.constructor).toBe(err.Missing)
  expect(missing.constructor).toBe(err.Missing)
  expect(missing).toBeInstanceOf(err.Error)
  expect(missing).not.toBeInstanceOf(other.Error)
  expect(missing.message).toBe('Missing 42')
  expect(Object.isFrozen(err)).toBe(false)
  expect(Object.isFrozen(err.Missing)).toBe(false)
})

it('retains details and causes and computes messages once', () => {
  const details = { id: 'first' }
  let calls = 0
  const registry = errors({
    Item: (value: { id: string }) => {
      calls++
      return value.id
    },
  })
  const cause = { code: 1 }
  const error = registry('Item', details, cause)
  details.id = 'later'
  expect(error.message).toBe('first')
  expect(error.details).toBe(details)
  expect(error.cause).toBe(cause)
  expect(calls).toBe(1)
})

it('supports constructor names that collide with object prototype properties', () => {
  const registry = errors({ ['__proto__']: () => 'prototype key' })
  const error = registry('__proto__')
  expect(error).toBeInstanceOf(registry['__proto__'])
  expect(error.message).toBe('prototype key')
})

it('captures definition functions when the registry is created', () => {
  const definitions = { Message: () => 'first' }
  const registry = errors(definitions)
  definitions.Message = () => 'second'
  expect(new registry.Message().message).toBe('first')
})

it('supports cause without details for zero-argument messages', () => {
  const error = new err.Offline(undefined, 'socket')
  expect(error.cause).toBe('socket')
  expect(err('Offline', undefined, 'socket').cause).toBe('socket')
})
