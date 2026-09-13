# match

```ts
function match<Value, Instances extends unknown[] = [], Results extends unknown[] = []>(
  value: Value,
  ...cases: { [Index in keyof Instances]: { on: Constructor<Instances[Index]>; do: (value: Instances[Index]) => unknown } } & {
    [Index in keyof Results]: { do: (value: never) => Results[Index] }
  }
): Results[number] | Exclude<Value, Instances[number]>
```

**Arguments**

- `value` The value to check.
- `cases` Constructor and handler pairs, checked in order. Each handler receives its constructor's instance type. Constructors can be concrete or abstract classes.

**Returns** The first handler result, or the original value when no constructor matches. A promise returned by a handler is returned unchanged.

## Usage

```ts
import { match } from 'wari'

const message = match(value, { on: err.Missing, do: (error) => `No record ${error.details.id}` }, { on: Error, do: (error) => error.message })
```

Handler exceptions propagate. Handler inputs and heterogeneous results are inferred without a fixed case-count limit. The output type includes each handler result and the unmatched input members. TypeScript subtracts matched instances structurally, which can be imprecise for distinct classes with identical instance shapes.
