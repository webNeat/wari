export type VoidToUndefined<T> = T extends void ? undefined : T
export type Prettify<T> = { [K in keyof T]: T[K] } | never

export type ToTuple<Union, Tuple extends unknown[] = []> = [Union] extends [never]
  ? Tuple
  : ToTuple<Exclude<Union, GetUnionItem<Union>>, [GetUnionItem<Union>, ...Tuple]>

type GetUnionItem<K> = Intersection<K extends any ? () => K : never> extends () => infer I ? I : never
export type Intersection<K> = (K extends any ? (k: K) => void : never) extends (k: infer X) => void ? X : never
