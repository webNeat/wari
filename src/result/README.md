# result

```ts
function result<Value>(value: Value): Result<Value>
```

**Arguments**

- `value` The immediate value or Error to inspect.

**Returns** `{ success: true, data }` for non-Errors, or `{ success: false, error }` for Errors. Broad inputs such as `object`, `{}`, `unknown`, and `any` use `Error` as the failure type.

## Usage

```ts
import { result } from 'wari'

const outcome = result(loadUser(id))
if (outcome.success) console.log(outcome.data)
else console.error(outcome.error)
```

Promises are ordinary values. `result` does not inspect their contents.
