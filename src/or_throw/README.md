# or_throw

```ts
function or_throw<Value>(value: Value): Exclude<Value, Error>
```

Throws `value` if it is an `Error`. Otherwise, returns it unchanged.

**Arguments**

- `value` The value to check.

**Returns** The original value with declared `Error` members excluded.

## Usage

Use `or_throw` to unwrap an immediate outcome.

```ts
import { or_throw } from 'wari'

const user = or_throw(await loadUser(id))
```

`or_throw` does not await promises or inspect their results.
