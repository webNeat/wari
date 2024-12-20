# wari

A type-safe way to create and handle errors in TypeScript.

[![Bundle size](https://img.shields.io/bundlephobia/minzip/wari?style=flat-square)](https://bundlephobia.com/result?p=wari)
[![Version](https://img.shields.io/npm/v/wari?style=flat-square)](https://www.npmjs.com/package/wari)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/webneat/wari/tests.yml?branch=main&style=flat-square)](https://github.com/webneat/wari/actions?query=workflow:"Tests")
[![MIT License](https://img.shields.io/npm/l/wari?style=flat-square)](LICENSE)

# Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Defining Error Types](#defining-error-types)
  - [Creating Errors](#creating-errors)
  - [Handling Errors](#handling-errors)
  - [Catching External Errors](#catching-external-errors)
  - [Creating Safe Functions](#creating-safe-functions)
- [Contributing](#contributing)
- [Changelog](#changelog)

# Introduction

**wari** is a TypeScript library that provides a type-safe way to create and handle errors. It allows you to define custom error types and handle them using pattern matching, without the need to create custom error classes or use `instanceof` checks.

## Why Use wari?

**wari** simplifies error handling by:

- Allowing you to define **error types** without creating new classes.
- Providing **type-safe functions** to create and handle errors.
- Enabling **pattern matching** on errors for cleaner and more maintainable code.

# Get started with `wari`

## Installation

Start by installing the library

```bash
npm install wari
# or
yarn add wari
# or
pnpm add wari
```

## Defining Error Types

`wari` exports the interface `ErrorTypes` which can used to add new error types as follows:

```ts
declare module 'wari' {
  interface ErrorTypes {
    'HttpError': {method: 'GET' | 'POST', url: string, status: number}
    'JsonError': {text: string}
    'FileError': {operation: 'read' | 'write', filePath: string, error: Error}
  }
}
```
This uses the [interfaces declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces) to make `wari` functions aware of the types of your custom errors.

You can think of the code above as equivalent to the following (but it doesn't actually create any classes):

```ts
class HttpError extends Error {
  public type = 'HttpError'
  constructor(public details: {method: 'GET' | 'POST', url: string, status: number}) {
    super(`HttpError: ${JSON.stringify(details)}`)
  }
}

class JsonError extends Error {
  public type = 'JsonError'
  constructor(public details: {text: string}) {
    super(`JsonError: ${JSON.stringify(details)}`)
  }
}

class FileError extends Error {
  public type = 'FileError'
  constructor(public details: {operation: 'read' | 'write', filePath: string, error: Error}) {
    super(`FileError: ${JSON.stringify(details)}`)
  }
}
```

## Creating Errors

Use the `new` function to create new errors. Typescript will offer you autocomplete for the first argument of the `new` function, so you don't have to remember all errors names. Once you choose a name, the second argument will be typed with the corresponding details type.

**Return errors instead of throwing them.**

```ts
import * as E from 'wari'

async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) return E.new('HttpError', {method: 'GET', url: '...', status: res.status})
  const text = await res.text()
  try {
    return JSON.parse(text) as Data
  } catch (err) {
    return E.new('JsonError', {text})
  }
}
```

**Note:** The `new` function has an alias called `make`, if you don't want to import all functions by using
```ts
import * as E from 'wari'

// Use `E.new`
```
You can import `make` instead:
```ts
import {make} from 'wari'

// Use `make` instead
```

## Handling Errors

Use `any`, `is` and `match` functions to handle errors.

Use `any` to check if a value is any error.

```ts
import * as E from 'wari'

async function main() {
  const data = await fetchData()
      // ^? Wari<'HttpError'> | Wari<'JsonError'> | Data
  if (E.any(data)) {
    // handle the error
    data
    // ^? Wari<'HttpError'> | Wari<'JsonError'>
  } else {
    // Use the data
    data
    // ^? Data
  }
}
```

The `is` function checks if a value corresponds to a specific error type. Typescript infers the possible types based on the first argument, and acceptes only those types in the second argument.

```ts
import * as E from 'wari'

async function main() {
  const data = await fetchData()
      // ^? Wari<'HttpError'> | Wari<'JsonError'> | Data
  if (E.is(data, 'HttpError')) {
    data.details
        // ^? {method: 'GET' | 'POST', url: string, status: number}
    return;
  }
  
  if (E.is(data, 'JsonError')) {
    data.details
        // ^? {text: string}
    return;
  }

  data
  // ^? Data
}
```

Use the `match` function to match a value against all possible error types. Typescript infers possible error types and gives you autocomplete. You can handle all or some errors separately and provide a default handler for the remaining errors as the third argument.

if the value given to `match` is not an error, it's simply returned as is. Otherwise, the corresponding handler is called and is returned value is returned.

```ts
import * as E from 'wari'

async function main() {
  const data = E.match(await fetchData(), {
    HttpError: err => {
            // ^? Err<'HttpError'>
      return defaultData as Data
    },
    JsonError: err => {
            // ^? Err<'JsonError'>
      console.error(err)
    }
  })
  data
  // ^? Data | undefined
}
```

## Catching External Errors

Even if you don't use `throw` in your code, external code may still throw errors when you call it. In that case, you can use `catch` to catch any thrown error and handle it:

```ts
import * as E from 'wari'

function mayThrow(x: number) {
  if (x === 42) throw new Error(`Ooops`)
  return x
}

E.catch(
  () => mayThrow(1),
  err => 0
) //=> 1

E.catch(
  () => mayThrow(42),
  err => 0
) //=> 0

E.catch(
  () => mayThrow(42),
  err => E.new('SomeError')
) //=> Err<'SomeError'>
```

**Note:** The `catch` function has an alias called `tryCatch`, if you don't want to import all functions by using

```ts
import * as E from 'wari'

// Use `E.catch`
```

You can import `tryCatch` instead:

```ts
import {tryCatch} from 'wari'

// Use `tryCatch` instead
```

## Creating Safe Functions

if you are calling a function that may throw multiple times across your code, you can use `safe` to create a safe function (a function that returns instead of throwing) from it. The returned function will take the same arguments and execute the original function:

- if no error is thrown, the result is simply returned.
- if an error is thrown (or a rejecting promise is returned), the given handler is called with the arguments and the error; its return is returned.

```ts
import * as E from 'wari'

const safeJsonParse = E.safe(JSON.parse, ([text], err) => E.new('JsonError', {text}))

safeJsonParse('{"') //=> Err<'JsonError'> with details {text: '{"'}
```

# Contributing

You can contribute to this library in many ways, including:

- **Reporting bugs**: Simply open an issue and describe the bug. Please include a code snippet to reproduce the bug, it really helps to solve the problem quickly.

- **Suggesting new features**: If you have a feature idea or a use case that is not covered, open an issue and we will discuss it. Do you already have an implementation for it? great, make a pull request and I will review it.

Those are just examples, any issue or pull request is welcome :)

# Changelog

**1.4.3 (November 30th 2024)**

- Fix stringifying circular objects

**1.4.2 (November 29th 2024)**

- Update dependencies and documentation
- Fix some types

**1.4.1 (November 21st 2023)**

- Update dependencies.

**1.4.0 (September 24th 2023)**

- Change the `catch` function to take a function with no arguments and a handler.
- Add `safe` function to create safe functions.

**1.3.0 (September 1st 2023)**

-  Change the `match` function to take the default handler as a third argment (instead of `_`) for better typing.

**1.2.0 (August 27 2023)**

- Improve `match` type inference, now the default handler `_` parameter type is only the remaining error types.

**1.1.0 (August 27 2023)**

- Refactor types.
- Add `new` alias for `make`.
- Add `any` to check for any wari error.
- Add `catch` (and `tryCatch` alias) to catch errors and wrap them into `Err<'Unknown'>`.

**1.0.0 (August 14 2023)**

- First version.

**1.0.0-alpha.1 (August 13 2023)**

- First alpha version.
