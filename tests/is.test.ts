import { test } from '@japa/runner'
import { is } from '../src/index.js'
import { WariError } from '../src/WariError.js'

test.group('is', () => {
  test('it checks the type of a WariError', ({ expect }) => {
    const error = new WariError('JsonError', {text: ''})
    expect(is(error, 'JsonError')).toBe(true)
    // @ts-expect-error
    expect(is(error, 'HttpError')).toBe(false)
  })

  test(`it's typed`, ({expectTypeOf}) => {
    expectTypeOf(is).toMatchTypeOf((_x: WariError<'FileError'>, _type: 'FileError'): boolean => true)
    expectTypeOf(is).toMatchTypeOf((_x: WariError<'FileError'|'JsonError'>, _type: 'FileError'|'JsonError'): boolean => true)
    expectTypeOf(is).not.toMatchTypeOf((_x: Error, _type: 'JsonError'): boolean => false)
  })
})
