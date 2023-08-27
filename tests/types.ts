import { Is, Equal } from 'just-types/test'
import { GetErrorKeys, GuardReturn, MatchHandlers, MatchReturn, Handler } from '../src/types/index.js'
import { Err } from '../src/Err.js'
import { ToTuple } from '../src/types/utils.js'

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
  Is<Equal<GuardReturn<never>, Err<'Unknown'>>>,
  Is<Equal<GuardReturn<void>, void | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<void>, void | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<null | boolean>, null | boolean | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<string>, string | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<number | Err<'FileError'>>, number | Err<'FileError'> | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<Error>, Error | Err<'Unknown'>>>,
  Is<Equal<GuardReturn<Promise<string | number>>, Promise<string | number | Err<'Unknown'>>>>,
  Is<Equal<GuardReturn<Promise<string | Err<'JsonError'>>>, Promise<string | Err<'JsonError'> | Err<'Unknown'>>>>,
]

type MatchHandlers_Tests = [
  Is<Equal<MatchHandlers<number>, {}>>,
  Is<Equal<MatchHandlers<Err<'X'> | number>, { X: Handler<'X'> } | { _: Handler<'X'> }>>,
  Is<
    Equal<
      MatchHandlers<Err<'X'> | Err<'Y'> | number>,
      { X: Handler<'X'>; Y: Handler<'Y'> } | { X: Handler<'X'>; _: Handler<'Y'> } | { _: Handler<'X'>; Y: Handler<'Y'> } | { _: Handler<'X' | 'Y'> }
    >
  >,
  Is<
    Equal<
      MatchHandlers<Err<'X'> | Err<'Y'> | Err<'Z'> | number>,
      | { X: Handler<'X'>; Y: Handler<'Y'>; Z: Handler<'Z'> }
      | { _: Handler<'X'>; Y: Handler<'Y'>; Z: Handler<'Z'> }
      | { X: Handler<'X'>; _: Handler<'Y'>; Z: Handler<'Z'> }
      | { X: Handler<'X'>; Y: Handler<'Y'>; _: Handler<'Z'> }
      | { X: Handler<'X'>; _: Handler<'Y' | 'Z'> }
      | { Y: Handler<'Y'>; _: Handler<'X' | 'Z'> }
      | { _: Handler<'X' | 'Y'>; Z: Handler<'Z'> }
      | { _: Handler<'X' | 'Y' | 'Z'> }
    >
  >,
]

type MatchReturn_Tests = [
  Is<Equal<MatchReturn<number | string, {}>, number | string>>,
  Is<Equal<MatchReturn<number | Err<'X'>, { _: (x: any) => number }>, number>>,
  Is<Equal<MatchReturn<number | Err<'X'>, { _: (x: any) => string }>, number | string>>,
  Is<Equal<MatchReturn<number | Err<'X'> | Err<'Y'>, { X: (x: any) => string; Y: (x: any) => boolean }>, number | string | boolean>>,
  Is<Equal<MatchReturn<number | Err<'X'> | Err<'Y'>, { X: (x: any) => Err<'Z'>; Y: (x: any) => boolean }>, number | Err<'Z'> | boolean>>,
]

export {}
