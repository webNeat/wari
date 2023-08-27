import { Is, Equal } from 'just-types/test'

export type VoidToUndefined<T> = T extends void ? undefined : T
export type Prettify<T> = { [K in keyof T]: T[K] } | never

export type ToTuple<Union, Tuple extends unknown[] = []> = [Union] extends [never]
  ? Tuple
  : ToTuple<Exclude<Union, GetUnionItem<Union>>, [GetUnionItem<Union>, ...Tuple]>

type GetUnionItem<K> = Intersection<K extends any ? () => K : never> extends () => infer I ? I : never
export type Intersection<K> = (K extends any ? (k: K) => void : never) extends (k: infer X) => void ? X : never

type ToTuple_Tests = [
  Is<Equal<ToTuple<never>, []>>,
  Is<Equal<ToTuple<'a'>, ['a']>>,
  Is<Equal<ToTuple<'a' | 'b'>, ['a', 'b']>>,
  Is<Equal<ToTuple<'a' | 'b' | 'c'>, ['a', 'b', 'c']>>,
]
