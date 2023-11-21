import { expect } from '@japa/expect'
import { expectTypeOf } from '@japa/expect-type'
import { configure, processCLIArgs, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.test.ts'],
  plugins: [expect(), expectTypeOf()],
  // reporters: [specReporter()],
  // importer: (filePath) => import(pathToFileURL(filePath).href),
})

run()
