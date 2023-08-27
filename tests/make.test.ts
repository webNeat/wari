import { test } from '@japa/runner'
import * as E from '../src/index.js'
import { make } from '../src/index.js'
import { Err } from '../src/Err.js'

test.group('make', () => {
  test('it creates a new Err', ({ expect }) => {
    const error = make('JsonError', { text: 'foo' })
    expect(error).toBeInstanceOf(Err)
    expect(error).toMatchObject({
      type: 'JsonError',
      details: { text: 'foo' },
    })
    expect(String(error)).toBe(`Error: JsonError: {"text":"foo"}`)
  })

  test('it has the new alias', ({ expect }) => {
    const error = E.new('JsonError', { text: 'foo' })
    expect(error).toBeInstanceOf(Err)
    expect(error).toMatchObject({
      type: 'JsonError',
      details: { text: 'foo' },
    })
  })

  test(`it's typed`, ({ expectTypeOf }) => {
    expectTypeOf(make).toMatchTypeOf((type: 'HttpError', details: { method: 'GET' | 'POST'; url: string; status: number }) => new Err(type, details))
    expectTypeOf(make).toMatchTypeOf((type: 'JsonError', details: { text: string }) => new Err(type, details))
    expectTypeOf(make).toMatchTypeOf(
      (type: 'FileError', details: { operation: 'read' | 'write'; filePath: string; error: Error }) => new Err(type, details),
    )
    expectTypeOf(make).not.toMatchTypeOf((type: 'HttpError', details: { url: string; status: number }) => new Err(type, details as any))
    expectTypeOf(make).not.toMatchTypeOf((_type: 'HttpError', _details: { url: string; status: number }) => new Error('Oups!'))
    expectTypeOf(make).not.toMatchTypeOf(
      (type: 'OtherError', details: { method: 'GET' | 'POST'; url: string; status: number }) => new Err(type as any, details),
    )
  })
})
