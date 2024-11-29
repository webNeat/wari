import { expect } from '@japa/expect'
import { expectTypeOf } from '@japa/expect-type'
import { processCLIArgs, configure, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.test.ts'],
  plugins: [expect(), expectTypeOf()],
})

run()
