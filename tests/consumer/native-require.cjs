const { attempt, errors, is, match, or, or_throw, pipe, result, safe } = require('wari')
if (!is(Date, new Date())) process.exit(1)
if (or('value', 'fallback') !== 'value') process.exit(1)
if (or(new TypeError('failed'), 'fallback') !== 'fallback') process.exit(1)
if (or_throw('value') !== 'value') process.exit(1)
const registry = errors({ Missing: (details) => `Missing ${details.id}` })
const missing = registry('Missing', { id: '42' })
if (!is(registry.Error, missing)) process.exit(1)
if (match(missing, { on: registry.Missing, do: (error) => error.message }) !== 'Missing 42') process.exit(1)
if (result(missing).error !== missing || result('value').data !== 'value') process.exit(1)
if (
  attempt(
    () => 'value',
    () => new Error(),
  ) !== 'value'
)
  process.exit(1)
if (
  safe(
    (value) => value,
    () => new Error(),
  )('value') !== 'value'
)
  process.exit(1)
if (pipe(1, (value) => value + 1) !== 2) process.exit(1)
const failure = new TypeError('failed')
try {
  or_throw(failure)
  process.exit(1)
} catch (error) {
  if (error !== failure) process.exit(1)
}
