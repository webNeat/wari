import { test } from '@japa/runner'
import {make} from '../src/index.js'
import { WariError } from '../src/WariError.js'

test.group('make', () => {
  test('it creates a new WariError', ({ expect }) => {
    const error = make('JsonError', {text: 'foo'})
    expect(error).toBeInstanceOf(WariError)
    expect(error).toMatchObject({
      type: 'JsonError',
      details: {text: 'foo'}
    })
    expect(String(error)).toBe(`Error: JsonError: {"text":"foo"}`)
  })
  
  test(`it's typed`, ({expectTypeOf}) => {
    expectTypeOf(make).toMatchTypeOf((type: 'HttpError', details: {method: 'GET' | 'POST', url: string, status: number}) => new WariError(type, details))
    expectTypeOf(make).toMatchTypeOf((type: 'JsonError', details: {text: string}) => new WariError(type, details))
    expectTypeOf(make).toMatchTypeOf((type: 'FileError', details: {operation: 'read' | 'write', filePath: string, error: Error}) => new WariError(type, details))
    expectTypeOf(make).not.toMatchTypeOf((type: 'HttpError', details: {url: string, status: number}) => new WariError(type, details as any))
    expectTypeOf(make).not.toMatchTypeOf((_type: 'HttpError', _details: {url: string, status: number}) => new Error('Oups!'))
    expectTypeOf(make).not.toMatchTypeOf((type: 'OtherError', details: {method: 'GET' | 'POST', url: string, status: number}) => new WariError(type as any, details))
  })
})
