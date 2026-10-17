# safe

```ts
type Captured<Value, Mapped extends Error> = Mapped | (Value extends PromiseLike<unknown> ? Promise<Awaited<Value> | Mapped> : Value)

function safe<This, Args extends unknown[], Value, Mapped extends Error>(
  fn: (this: This, ...args: Args) => Value,
  mapper: (cause: unknown, args: Args) => Mapped,
): (this: This, ...args: Args) => Captured<Value, Mapped>
```

**Arguments**

- `fn` The function to wrap.
- `mapper` Converts a thrown or rejected value and the call's arguments to an Error.

**Returns** A reusable wrapper that forwards its receiver and arguments. The mapper runs only for thrown or rejected values. Mapper exceptions escape.

## Usage

```ts
import { safe } from 'wari'

const read = safe(
  (id: string) => loadUser(id),
  (_cause, args) => new Error(`Cannot load ${args[0]}`),
)
```

Returned Errors pass through unchanged. Promise-like results are assimilated.
