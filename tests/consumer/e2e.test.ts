import { expect, it } from 'vite-plus/test'
import { attempt, errors, is, match, or, or_throw, pipe, result, safe } from 'wari'

it('recognizes constructor instances', () => {
  expect(is(Date, new Date())).toBe(true)
  expect(is(Date, {})).toBe(false)
})

it('exports and runs the remaining helpers', () => {
  const err = errors({ Missing: (details: { id: string }) => `Missing ${details.id}` })
  const failure = err('Missing', { id: '42' })
  expect(is(err.Error, failure)).toBe(true)
  expect(match(failure, { on: err.Missing, do: (error) => error.message })).toBe('Missing 42')
  expect(result(failure)).toEqual({ success: false, error: failure })
  expect(result('value')).toEqual({ success: true, data: 'value' })
  expect(
    attempt(
      () => 2,
      () => new Error(),
    ),
  ).toBe(2)
  expect(
    safe(
      (id: string) => id,
      () => new Error(),
    )('id'),
  ).toBe('id')
  expect(pipe(2, (value) => value + 1)).toBe(3)
  expect(or('value', 'fallback')).toBe('value')
})

it('returns successful values and throws Errors', () => {
  expect(or(new TypeError('failed'), 'fallback')).toBe('fallback')
  expect(or_throw('value')).toBe('value')
  expect(() => or_throw(new TypeError('failed'))).toThrow(TypeError)
})
