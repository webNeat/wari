import { expectTypeOf } from 'vite-plus/test'
import { is } from '../../src/index.js'

class RecordValue {
  constructor(readonly id: string) {}
}

declare const value: unknown
if (is(RecordValue, value)) {
  expectTypeOf(value).toEqualTypeOf<RecordValue>()
  expectTypeOf(value.id).toEqualTypeOf<string>()
}
