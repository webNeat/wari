import { test } from '@japa/runner'
import { any } from '../src/index.js'
import { Err } from '../src/Err.js'

test.group('any', () => {
  test('it checks if an object is an instance of Err', ({ expect }) => {
    const error = new Err('JsonError', { text: '' })
    expect(any(error)).toBe(true)
    expect(any('foo')).toBe(false)
    expect(any(new Error('Some error'))).toBe(false)
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    expectTypeOf(any).toMatchTypeOf((_x: Err<'FileError'>) => true)
    expectTypeOf(any).toMatchTypeOf((_x: Err<'FileError'> | Err<'JsonError'>) => true)
    expectTypeOf(any).toMatchTypeOf((_x: Error) => false)
  })
})
