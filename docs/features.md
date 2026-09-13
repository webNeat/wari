# Feature specifications

## Package API

The package exposes these named root exports:

```ts
import { errors, is, match, attempt, safe, pipe, result, or, or_throw } from 'wari'
```

There is no default export. There is no `wari/result` entry point.

The library uses ordinary values and `Error` instances. It has no runtime dependencies and must work in Node, browsers, and workers without platform-specific imports.

## Errors

### Registry creation

`errors(definitions)` creates a local error registry. Each definition is a synchronous message function with either zero parameters or one required parameter of any type. Its return type is `string`.

```ts
const err = errors({
  Missing: (details: { id: string }) => `Record ${details.id} was not found`,
  Offline: () => 'The service is offline',
})
```

Static message values, optional details parameters, rest parameters, multiple details parameters, and asynchronous message functions are not supported definitions. JavaScript callers and type escapes are not runtime-validated.

Definitions are captured when the registry is created. The registry retains the supplied function references; changing the source map later does not replace its constructors. Mutations to values closed over by a message function still apply.

### Construction

A registry is both callable by error name and exposes each constructor as a direct property. Both forms use the same constructor and identity.

```ts
const missing = err('Missing', { id: '42' })
const alsoMissing = new err.Missing({ id: '42' })

missing instanceof err.Missing // true
```

A constructor name is the corresponding definition key. Callers do not repeat the name inside a definition. Generated constructors require `new`; generated-class subclassing is not a supported contract.

Definitions with details require one details argument. Definitions without details take none. Both construction forms accept an optional positional cause after the details argument:

```ts
const noDetails = new err.Offline()
const caused = new err.Offline(undefined, 'socket closed')
const alsoCaused = err('Offline', undefined, 'socket closed')
const causedByObject = err('Missing', { id: '42' }, { status: 404 })
```

Causes may be any value and are stored directly on the instance. No options object or native Error options support is required.

Every registry has a distinct base class at `err.Error`. Generated classes extend that base, which extends native `Error`. The base is abstract in public declarations and exists for recognition, not direct construction.

```ts
const isRegistryError = (value: unknown) => is(err.Error, value)
const messageForRegistryError = match(missing, { on: err.Error, do: (error) => error.message })
```

Typing acceptance for the abstract base remains unresolved. In particular, verify that its instance type can represent the generated instance union, including each literal name and associated details type, and that base guards and handlers infer that union.

### Instance behavior

Construction computes the message once. An error's message does not change if its details later change. Details are retained by reference, not cloned or deep-frozen.

The public instance type marks `name` and `details` readonly. This is a TypeScript restriction only. The implementation does not freeze instances, lock properties, validate message results, or trim stack frames. Details and causes use ordinary enumerable property assignment. Native Error stack behavior is retained where the runtime provides it.

The registry and generated constructors are not frozen. Registry constructor properties are readonly in TypeScript. The key `Error` is reserved for the base class. Validation of other callable-registry property collisions is postponed.

## Recognition

`is` takes a constructor first and a value second. It supports any class, not only Error subclasses, and uses ordinary `instanceof`.

```ts
if (is(err.Missing, value)) {
  value.details.id
}

is(Error, value)
is(Date, value)
```

It does not recognize cross-realm instances unless ordinary `instanceof` does. It does not provide broad error detection, schema validation, or a security check. `Symbol.hasInstance` and other errors raised by `instanceof` propagate.

## Matching

`match(value, ...cases)` takes variadic cases shaped as `{ on: Constructor, do: handler }`. Constructors can be any class. Each handler receives the instance type of its own constructor.

```ts
const description = match(value, { on: err.Missing, do: (error) => `No record ${error.details.id}` }, { on: Error, do: (error) => error.message })
```

Cases are checked in order. The first matching handler runs immediately and its return value is returned unchanged, including a promise. No later case runs. If nothing matches, `match` returns the original input. A handler exception propagates; a returned promise rejection belongs to the caller.

Matching does not capture exceptions, await handlers, or inspect names. There are no predicate cases or name-map cases. Structural TypeScript subtraction is used to type the unhandled branch. This can be unsound when distinct classes have structurally identical instance types: runtime matching still uses constructor identity.

Acceptance requires useful handler inference and output typing for heterogeneous, unbounded variadic case lists. Bounded-overload prototypes do not prove this requirement. If that inference cannot be expressed reliably, revisit the signature rather than silently imposing a case-count limit.

## Capturing failures

### `attempt`

`attempt(fn, mapper)` invokes `fn` once. The required synchronous mapper converts a caught value, typed `unknown`, to an `Error`.

```ts
const outcome = attempt(
  () => readRecord(id),
  (cause) => new err.Offline(undefined, cause),
)
```

Immediate throws and rejections from returned promise-like values are mapped. Immediate successful values remain immediate; promise-like successes receive rejection handling. Therefore an immediate throw can produce an `Error` even when the normal return type is a promise.

A normally returned `Error` passes through unchanged and is not mapped. The mapper is synchronous and must return an `Error` by type. There is no runtime return validation. Mapper throws escape and are not captured again. `attempt` has no default mapper, implicit wrapper, or sync/async variants.

### `safe`

`safe(fn, mapper)` returns a reusable wrapper with the same capture rules as `attempt`.

```ts
const readSafely = safe(
  (id: string) => readRecord(id),
  (cause, args) => new err.Missing({ id: args[0] }),
)

const value = readSafely('42')
```

The mapper receives `(cause, args)`. `args` is the invocation's original argument tuple. The wrapper calls the target with its invocation-time `this` value. It preserves concrete parameter tuples, optional and rest parameters, and supported receiver types. Full generic and overloaded call-signature preservation is postponed.

The mapper handles only thrown or rejected values, not normally returned errors. Mapper errors escape. Mapper return types are synchronous `Error` types; runtime validation is not performed. Automatic capture recognizes promise-like values, not only native `Promise` instances. Promise-like assimilation and throwing `then` accessors require runtime tests.

## Pipeline

`pipe(initial, ...steps)` applies each step to the previous successful value. A returned `Error` stops the pipeline, including an initial Error, and is returned unchanged. This applies to errors from any registry and to ordinary native Error subclasses. A step's declared Error return is excluded from the next step's input and included in the output type.

```ts
const outcome = pipe(
  getUser(id),
  (user) => loadProfile(user),
  (profile) => profile.email,
)
```

Synchronous paths remain synchronous. If the initial value or a step returns a promise-like value, the pipeline awaits it and subsequent results. An awaited Error also stops the pipeline. Function values are data; pipe does not invoke the initial value as a thunk.

Pipe captures synchronous step throws and rejections from the initial promise-like value or step results. A thrown or rejected Error is returned unchanged. A non-Error rejection reason or thrown value is wrapped in a native `Error` with a generic message and the exact original value stored directly as `cause`. Pipe has no mapper or options.

The initial expression is evaluated before `pipe` is called, so a synchronous throw while evaluating it cannot be captured.

The inferred output includes the initial returned Error, declared step-returned errors, and final successful output. It does not add a broad Error for exceptions captured at runtime. This accepted typing boundary means runtime capture can return an Error absent from the inferred type. Test and document that limitation explicitly. Pipe provides sequential contextual inference for up to ten callbacks, including promise-like intermediates. Longer pipelines retain an annotated variadic fallback; unannotated inference beyond ten callbacks is not guaranteed. The test suite validates the ten-callback limit and the annotated longer-pipeline path.

## Immediate outcome helpers

These helpers inspect immediate values only. They do not await, detect promises, or attach rejection handlers. All recognize errors using same-realm `instanceof Error` behavior.

`result(value)` returns a discriminated union:

```ts
const converted = result(value)
// Success branch contains the input's non-Error members.
// Failure branch preserves the input's declared Error members.
```

Conversion preserves useful failure typing for broad inputs such as `unknown`, which may contain Errors. It does not execute a function or classify payloads inside application-defined wrappers.

`or(value, fallback)` returns `fallback` when `value` is an Error, otherwise the original value. Infer the output from successful input members and the fallback type. The fallback can have any type. A function fallback is data and is not invoked.

```ts
const selected = or(value, () => 'use this function as data')
```

`or_throw(value)` throws the exact Error instance when given an Error, and otherwise returns the original value.

There are no async variants and no explicit-result constructors, capture adapters, or unwrap helper family.

## Typing boundaries

Returned Errors represent expected failures. Preserve their declared types and infer successful values without requiring library-specific brands.

TypeScript is structural: a declared type can hide an actual Error, and plain data can structurally satisfy Error without being an instance. Bare unions cannot fully describe these overlaps. Applications handling Errors as successful data or arbitrary unknown payloads must choose their own explicit wrappers.

Constructor matching and pipeline capture have the additional accepted typing boundaries described above. Do not describe the API as completely sound across those boundaries.

## Compatibility and acceptance

The package provides named root exports in ESM and CommonJS with declarations resolved for both. There is no Node-only runtime code and no third-party runtime dependency. Minimum Node and TypeScript versions remain undecided until the prototype is validated.

Acceptance tests must cover:

- Registry construction through both forms, shared constructor identity, distinct registry bases, details and causes by reference, one-time message computation, and ordinary Error behavior.
- Type-level correlation of registry names, details, constructor arguments, and inferred handler inputs. Include abstract base recognition, strict compiler options, and any limitations found.
- `is` and `match` constructor behavior, first-match ordering, passthrough, exceptions, promise return preservation, and structurally identical classes.
- `attempt` and `safe` immediate values, thrown values, promise rejections, thenables, mapper exceptions, normally returned Errors, receiver forwarding, and argument tuples.
- `pipe` initial and step Errors, synchronous and promise-like paths, thrown and rejected Error and non-Error values, exact cause storage, and its runtime/type boundary.
- `result`, `or`, and `or_throw` with immediate values, Errors, function fallbacks, and promises treated as ordinary values.
- ESM and CommonJS package imports, declarations, and execution in Node, browsers, and workers.

Do not claim unbounded variadic `match` inference until acceptance tests pass. `pipe` intentionally guarantees unannotated sequential inference for ten callbacks, with an annotated variadic fallback beyond that limit.

## Removed or postponed

Removed: default export, standalone `error`, `ErrorOf`, curried `is`, `instance_of`, predicate and name-map matching, async helper variants, dedicated recovery and binary continuation, failure observers and transformers, the explicit-result subpath and helper family, supported user subclassing of generated errors, automatic cross-realm error detection, stack trimming, runtime freezing, and message/mapper-result validation.

Postponed: collection partitioning, registry collision validation beyond reserving `Error`, full generic or overload preservation in `safe`, and minimum runtime and compiler versions.

Prototype work still required: abstract registry-base typing and unbounded variadic matching. These are validation tasks, not additional accepted functionality.
