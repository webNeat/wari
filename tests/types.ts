import { Is, Equal } from 'just-types/test'
import { GetErrorKeys, GuardReturn, MatchHandlers, MatchReturn, Handler } from '../src/types/index.js'
import { Err } from '../src/Err.js'

declare module '../src/index.js' {
  interface ErrorTypes {
    HttpError: { method: 'GET' | 'POST'; url: string; status: number }
    JsonError: { text: string }
    FileError: { operation: 'read' | 'write'; filePath: string; error: Error }
  }
}

type GetErrorKeys_Tests = [
  Is<Equal<GetErrorKeys<null | undefined | true | false>, never>>,
  Is<Equal<GetErrorKeys<number | string>, never>>,
  Is<Equal<GetErrorKeys<{ type: 'Unknown'; details: { error: Error } }>, never>>,
  Is<Equal<GetErrorKeys<Error>, never>>,
  Is<Equal<GetErrorKeys<Err<'Unknown'>>, 'Unknown'>>,
  Is<Equal<GetErrorKeys<Err<'Unknown'> | Err<'HttpError'>>, 'Unknown' | 'HttpError'>>,
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
  Is<Equal<MatchHandlers<number | Err<'Unknown'>>, { Unknown: Handler<'Unknown'> } | { _: Handler<'Unknown'>; Unknown?: Handler<'Unknown'> }>>,
  Is<
    Equal<
      MatchHandlers<number | Err<'Unknown'> | Err<'JsonError'>>,
      | { Unknown: Handler<'Unknown'>; JsonError: Handler<'JsonError'> }
      | { _: (x: Err<'Unknown'> | Err<'JsonError'>) => any; Unknown?: Handler<'Unknown'>; JsonError?: Handler<'JsonError'> }
    >
  >,
]

type MatchReturn_Tests = [
  Is<Equal<MatchReturn<number | string, {}>, number | string>>,
  Is<Equal<MatchReturn<number | Err<'Unknown'>, { _: (x: any) => number }>, number>>,
  Is<Equal<MatchReturn<number | Err<'Unknown'>, { _: (x: any) => string }>, number | string>>,
  Is<
    Equal<
      MatchReturn<number | Err<'Unknown'> | Err<'JsonError'>, { Unknown: (x: any) => string; JsonError: (x: any) => boolean }>,
      number | string | boolean
    >
  >,
  Is<
    Equal<
      MatchReturn<number | Err<'Unknown'> | Err<'JsonError'>, { Unknown: (x: any) => Err<'HttpError'>; JsonError: (x: any) => boolean }>,
      number | Err<'HttpError'> | boolean
    >
  >,
]

export {}
