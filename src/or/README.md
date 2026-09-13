# or

```ts
function or<Value, Fallback>(value: Value, fallback: Fallback): Exclude<Value, Error> | Fallback
```

Returns `fallback` if `value` is an `Error`. Otherwise, returns `value` unchanged.

**Arguments**

- `value` The value to check.
- `fallback` The value to return when `value` is an `Error`.

**Returns** The original value with declared `Error` members excluded, or `fallback`.

## Usage

Use `or` to select a value from an immediate outcome.

```ts
import { or } from 'wari'

const user = or(loadUser(id), defaultUser)
```

`or` does not call functions or inspect promises.
