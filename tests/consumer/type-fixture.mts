import { attempt, errors, is, match, or, or_throw, pipe, result, safe } from 'wari'

class Item {
  constructor(readonly id: string) {}
}

class Other {
  constructor(readonly code: number) {}
}

declare const value: unknown
if (is(Item, value)) {
  const item: Item = value
  const id: string = item.id
  void id
}
// @ts-expect-error is requires a constructor
is({}, value)

declare const outcome: string | TypeError
const selected: string | number = or(outcome, 1)
void selected
// @ts-expect-error or excludes declared Error members from the input
const invalidFallback: TypeError = or(outcome, 1)
void invalidFallback

const unwrapped: string = or_throw(outcome)
void unwrapped
// @ts-expect-error or_throw excludes Error values
const invalid: TypeError = or_throw(outcome)
void invalid

const registry = errors({ Missing: (details: { id: string }) => details.id })
const missing = registry('Missing', { id: '42' })
const id: string = missing.details.id
const direct = new registry.Missing({ id: 'direct' })
void direct
const converted = result(Math.random() ? missing : 'ok')
if (!converted.success) {
  const failure: InstanceType<typeof registry.Missing> = converted.error
  void failure
} else {
  const data: string = converted.data
  void data
}
const matched = match(missing, { on: registry.Missing, do: (error) => error.details.id })
const heterogeneous = match(
  Math.random() ? new Item('42') : new Other(7),
  { on: Item, do: (item) => item.id },
  { on: Other, do: (other) => other.code },
)
const matchedOutput: string | number = heterogeneous
void matchedOutput
const piped = pipe(1, (value) => value + 1)
const attempted = attempt(
  () => 1,
  () => new Error(),
)
const wrapped = safe(
  (value: number) => value + 1,
  () => new Error(),
)
void [id, matched, piped, attempted, wrapped]
