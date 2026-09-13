# is

```ts
function is<Class extends AnyClass>(SomeClass: Class, value: unknown): value is Instance<Class>
```

Checks if a value is an instance of a class. Uses `instanceof`.

**Arguments**

- `SomeClass` The class to check against. Accepts built-in, custom, and abstract classes.
- `value` The value to check.

**Returns** `true` if `value instanceof SomeClass` is true. Otherwise, returns `false`. When the result is true, TypeScript narrows `value` to an instance of `SomeClass`.

## Usage

Use `is` to check if a value is some specific error.

```ts
import { is } from 'wari'

function process(): SomeError | Result {...}

const res = process()
if (is(SomeError, res)) {
  // handle the error
} else {
  // res is a `Result` here
}
```
