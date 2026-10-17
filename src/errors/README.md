# errors

```ts
function errors<const DefinitionsMap extends Definitions>(
  definitions: DefinitionsMap & ValidDefinitions<DefinitionsMap>,
): Registry<DefinitionsMap>
```

**Arguments**

- `definitions` Synchronous message functions keyed by error name. Each function takes no parameters or one required details parameter and returns a string.

**Returns** A callable registry with a constructor for each definition and a registry-specific abstract `Error` base. Constructors accept the required details, when present, and an optional positional cause.

## Usage

```ts
import { errors } from 'wari'

const err = errors({ Missing: (details: { id: string }) => `Missing ${details.id}` })
const missing = err('Missing', { id: '42' })
const alsoMissing = new err.Missing({ id: '42' })

missing instanceof err.Missing // true
err.Missing === missing.constructor // true
```

The callable and direct constructor forms share the same constructor. Messages are computed once. Details and causes are retained by reference. Definitions are captured when the registry is created. The key `Error` is reserved.
