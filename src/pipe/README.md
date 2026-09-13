# pipe

```ts
type Step<Previous, Next> = (value: Exclude<Awaited<Previous>, Error>) => Next

type Output<Initial, Last, Steps extends readonly unknown[]> = /* inferred result */

function pipe<Initial, Next>(
  initial: Initial,
  step: Step<Initial, Next>,
): Output<Initial, Next, readonly [Next]>
```

This shows the one-step typed overload. The API also provides sequential overloads through ten steps, plus an annotated variadic fallback.

**Arguments**

- `initial` The value to pass through the steps.
- `steps` Functions applied in order.

**Returns** The final value or a returned Error. Promise-like values are awaited. Thrown or rejected non-Errors become native Errors with the original value in `cause`.

## Usage

```ts
import { pipe } from 'wari'

const outcome = pipe(
  getUser(id),
  (user) => loadProfile(user),
  (profile) => profile.email,
)
```

Each step receives the previous successful value, with Error members excluded. Unannotated sequential inference is supported for ten steps. Longer pipelines use an annotated variadic fallback. Runtime capture can return an Error that is absent from the inferred type. A synchronous throw while evaluating `initial` happens before `pipe` runs.
