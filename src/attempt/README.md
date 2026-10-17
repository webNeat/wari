# attempt

```ts
type Captured<Value, Mapped extends Error> = Mapped | (Value extends PromiseLike<unknown> ? Promise<Awaited<Value> | Mapped> : Value)

function attempt<Value, Mapped extends Error>(fn: () => Value, mapper: (cause: unknown) => Mapped): Captured<Value, Mapped>
```

**Arguments**

- `fn` The function to call once.
- `mapper` Converts a thrown or rejected value to an Error.

**Returns** The immediate value or mapped Error, or a promise for a promise-like result. The promise resolves to its value or a mapped Error. Mapper exceptions escape.

## Usage

```ts
import { attempt } from 'wari'

const outcome = attempt(
  () => loadUser(id),
  (cause) => new Error('Load failed', { cause }),
)
```

A returned Error passes through unchanged. Promise-like values are assimilated.
