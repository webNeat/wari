import { expect } from '@japa/expect'
import { pathToFileURL } from 'node:url'
import { specReporter } from '@japa/spec-reporter'
import { expectTypeOf } from '@japa/expect-type'
import { processCliArgs, configure, run } from '@japa/runner'

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.test.ts'],
    plugins: [expect(), expectTypeOf()],
    reporters: [specReporter()],
    importer: (filePath) => import(pathToFileURL(filePath).href),
  },
})

run()
