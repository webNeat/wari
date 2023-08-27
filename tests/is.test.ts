import { test } from '@japa/runner'
import { is } from '../src/index.js'
import { Err } from '../src/Err.js'

test.group('is', () => {
  test('it checks the type of a Err', ({ expect }) => {
    const error = new Err('JsonError', { text: '' })
    expect(is(error, 'JsonError')).toBe(true)
    // @ts-expect-error
    expect(is(error, 'HttpError')).toBe(false)
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    expectTypeOf(is).toMatchTypeOf((_x: Err<'FileError'>, _type: 'FileError'): boolean => true)
    expectTypeOf(is).toMatchTypeOf((_x: Err<'FileError' | 'JsonError'>, _type: 'FileError' | 'JsonError'): boolean => true)
    expectTypeOf(is).not.toMatchTypeOf((_x: Error, _type: 'JsonError'): boolean => false)
  })
})
