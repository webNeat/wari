import { Is, Equal } from 'just-types/test'
import { Err } from '../src/Err.js'
import { ToTuple } from '../src/types/utils.js'
import { GetErrorKeys, GuardReturn, MatchHandlers, MatchReturn, Handler } from '../src/types/index.js'

declare module '../src/index.js' {
  interface ErrorTypes {
    HttpError: { method: 'GET' | 'POST'; url: string; status: number }
    JsonError: { text: string }
    FileError: { operation: 'read' | 'write'; filePath: string; error: Error }

    X: {}
    Y: {}
    Z: {}
  }
}

type ToTuple_Tests = [
  Is<Equal<ToTuple<never>, []>>,
  Is<Equal<ToTuple<'a'>, ['a']>>,
  Is<Equal<ToTuple<'a' | 'b'>, ['a', 'b']>>,
  Is<Equal<ToTuple<'a' | 'b' | 'c'>, ['a', 'b', 'c']>>,
]

type GetErrorKeys_Tests = [
  Is<Equal<GetErrorKeys<null | undefined | true | false>, never>>,
  Is<Equal<GetErrorKeys<number | string>, never>>,
  Is<Equal<GetErrorKeys<{ type: 'X'; details: { error: Error } }>, never>>,
  Is<Equal<GetErrorKeys<Error>, never>>,
  Is<Equal<GetErrorKeys<Err<'X'>>, 'X'>>,
  Is<Equal<GetErrorKeys<Err<'X'> | Err<'Y'>>, 'X' | 'Y'>>,
]

type GuardReturn_Tests = [
  Is<Equal<GuardReturn<never, Err<'X'>>, Err<'X'>>>,
  Is<Equal<GuardReturn<void, Err<'X'>>, void | Err<'X'>>>,
  Is<Equal<GuardReturn<void, Err<'X'>>, void | Err<'X'>>>,
  Is<Equal<GuardReturn<null | boolean, Err<'X'>>, null | boolean | Err<'X'>>>,
  Is<Equal<GuardReturn<string, Err<'X'>>, string | Err<'X'>>>,
  Is<Equal<GuardReturn<number | Err<'FileError'>, Err<'X'>>, number | Err<'FileError'> | Err<'X'>>>,
  Is<Equal<GuardReturn<Error, Err<'X'>>, Error | Err<'X'>>>,
  Is<Equal<GuardReturn<Promise<string | number>, Err<'X'>>, Promise<string | number | Err<'X'>>>>,
  Is<Equal<GuardReturn<Promise<string | Err<'JsonError'>>, Err<'X'>>, Promise<string | Err<'JsonError'> | Err<'X'>>>>,
]

type MatchHandlers_Tests = [
  Is<Equal<MatchHandlers<number>, {}>>,
  Is<Equal<MatchHandlers<Err<'X'> | number>, { X: Handler<'X'> }>>,
  Is<Equal<MatchHandlers<Err<'X'> | Err<'Y'> | number>, { X: Handler<'X'>; Y: Handler<'Y'> }>>,
  Is<Equal<MatchHandlers<Err<'X'> | Err<'Y'> | Err<'Z'> | number>, { X: Handler<'X'>; Y: Handler<'Y'>; Z: Handler<'Z'> }>>,
]

type MatchReturn_Tests = [
  Is<Equal<MatchReturn<number | string, {}>, number | string>>,
  Is<Equal<MatchReturn<number | Err<'X'>, { _: (x: any) => number }>, number>>,
  Is<Equal<MatchReturn<number | Err<'X'>, { _: (x: any) => string }>, number | string>>,
  Is<Equal<MatchReturn<number | Err<'X'> | Err<'Y'>, { X: (x: any) => string; Y: (x: any) => boolean }>, number | string | boolean>>,
  Is<Equal<MatchReturn<number | Err<'X'> | Err<'Y'>, { X: (x: any) => Err<'Z'>; Y: (x: any) => boolean }>, number | Err<'Z'> | boolean>>,
]

export {}
