# wari

A type-safe way to create and handle errors.

[![Version](https://img.shields.io/npm/v/wari?style=flat-square)](https://www.npmjs.com/package/wari)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/webneat/wari/tests.yml?branch=main&style=flat-square)](https://github.com/webneat/wari/actions?query=workflow:"Tests")
[![MIT](https://img.shields.io/npm/l/wari?style=flat-square)](LICENSE)

# Contents

- [Introduction](#introduction)
- [Basic usage steps](#basic-usage-steps)
  - [ 1. Installation](#1-installation)
  - [ 2. Define your error types](#2-define-your-error-types)
  - [ 3. Create errors](#3-create-errors)
  - [ 4. Handle errors](#4-handle-errors)
- [Using `wari` without `throw`](#using-wari-without-throw)
- [API reference](#api-reference)
- [Contributing](#contributing)
- [Changelog](#changelog)

# Introduction

Consider the following Nodejs code

```ts
import {writeFile} from 'fs/promises'

async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) throw new Error(`HTTP request failed`)
  try {
    const data = await res.json()
    return data
  } catch (err) {
    throw new Error('HTTP response content is not valid JSON')
  }
}

async function writeData(filePath, data) {
  try {
    await writeFile(filePath, JSON.stringify(data))
  } catch (err) {
    throw new Error(`Error while writing to file ${filePath}`)
  }
}

async function main() {
  try {
    const data = await fetchData()
    // ... transform data
    await writeData('result.json', transformedData)
  } catch (err) {
    // how to handle `err` differently depending on the actual error?
  }
}
```

The standard solution to differenciate between thrown errors is to create a new class that extends the `Error` class and use `instanceof` to check the type of `err`:

```ts
import {writeFile} from 'fs/promises'

class HttpError extends Error {}
class JsonError extends Error {}
class FileError extends Error {}

async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) throw new HttpError(`HTTP request failed`)
  try {
    const data = await res.json()
    return data
  } catch (err) {
    throw new JsonError('HTTP response content is not valid JSON')
  }
}

async function writeData(filePath, data) {
  try {
    await writeFile(filePath, JSON.stringify(data))
  } catch (err) {
    throw new FileError(`Error while writing to file ${filePath}`)
  }
}

async function main() {
  try {
    const data = await fetchData()
    // ... handle/transform data
    await writeData('result.json', transformedData)
  } catch (err) {
    if (err instanceof HttpError) {
      // handle HTTP error
    } else if (err instanceof JsonError) {
      // handle JSON error
    } else if (err instanceof FileError) {
      // handle file error
    } else {
      // handle other errors
    }
  }
}
```

This works, now what if we need more details about the error? We will need to add properties to the errors classes and fill them in the constructors:

```ts
import {writeFile} from 'fs/promises'

class HttpError extends Error {
  constructor(public method: 'GET' | 'POST', public url: string, public status: number) {
    super(`${method} request to '${url}' failed with status code ${status}`)
  }
}

class JsonError extends Error {
  constructor(public text: string) {
    super(`Failed to parse the text '${text}' as JSON`)
  }
}

class FileError extends Error {
  constructor(public operation: 'read' | 'write', public filePath: string, public error: Error) {
    super(`The ${operation} operation on file '${filePath}' has failed with error '${error}'`)
  }
}

async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) throw new HttpError('GET', '...', res.status)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new JsonError(text)
  }
}

async function writeData(filePath, data) {
  try {
    await writeFile(filePath, JSON.stringify(data))
  } catch (err) {
    throw new FileError('write', filePath, err)
  }
}

async function main() {
  try {
    const data = await fetchData()
    // ... handle/transform data
    await writeData('result.json', transformedData)
  } catch (err) {
    if (err instanceof HttpError) {
      // err.method, err.url and err.status can be used here
    } else if (err instanceof JsonError) {
      // err.text can be used here
    } else if (err instanceof FileError) {
      // err.operation, err.filePath and the original err.error can be used here
    } else {
      // handle other errors
    }
  }
}
```

This is better and more flexible, but it has some issues:
- The code is verbose.
- We need to create a new class for every new error type.
- We need to remember the error class names and import them to do `err instanceof ErrorClass`.

The goal of `wari` is to solve these issues while keeping type-safety and being easy to use.

**Note:** if you are thinking "The actual issue is the use of `try/catch`! if you use an `Either` monad or similar then all these issues will desapair!", then you are correct. I personally prefer the functional programming way of handling errors, and I don't like `try/catch`. But the majority of codebases are using `throw` and `try/catch`, so having this library can make handling errors on those projects easier. Also `wari` doesn't require the usage of `try/catch`, you can use it to return errors and check their types in the calling functions.

# Basic usage steps

## 1. Installation

Start by installing the library

```bash
npm install wari
# or
yarn add wari
# or
pnpm add wari
```

## 2. Define your error types

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

The code snippet above is equivalent to the following (but it doesn't actually create any classes):

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

## 3. Create errors

Use the `make` function to create new errors

```ts
async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) throw wari.make('HttpError', {method: 'GET', url: '...', status: res.status})
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    throw wari.make('JsonError', {text})
  }
}
```

Typescript will offer you autocomplete for the first argument of the `make` function, so you don't have to remember all errors names. Once you choose a name, the second argument will be typed with the corresponding details type.

## 4. Handle errors

Use the `is` and `match` functions to handle errors.

The `is` function checks if a value corresponds to an error type:

```ts
try {
  ...
} catch (err) {
  if (wari.is(err, 'HttpError')) {
    // handle Http error
    // err.details type will be {method: 'GET' | 'POST', url: string, status: number}
  }
}
```

if you want to check for multiple error types, instead of doing:

```ts
try {
  ...
} catch (err) {
  if (wari.is(err, 'HttpError')) {
    // ...
  } else if (wari.is(err, 'JsonError')) {
    // ...
  } else if (wari.is(err, 'FileError')) {
    // ...
  } else {
    // ...
  }
}
```

You can use the `match` function and do:

```ts
try {
  ...
} catch (err) {
  wari.match(err, {
    'HttpError': err => {
      // ...
    },
    'JsonError': err => {
      // ...
    },
    'FileError': err => {
      // ...
    },
    '_': err => {
      // handle other errors here!
    }
  })
}
```

# Using `wari` without `throw`

As I mentioned in the introduction, `try/catch` is not a good pattern and should be avoided when possible. `wari` encourages you to handle errors without using `throw`. Here is the example of the introduction rewritten:

```ts
import {writeFile} from 'fs/promises'

async function fetchData() {
  const res = await fetch('...')
  if (!res.ok) return wari.make('HttpError', {method: 'GET', url: '...', status: res.status})
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    return wari.make('JsonError', {text})
  }
}

async function writeData(filePath, data) {
  try {
    await writeFile(filePath, JSON.stringify(data))
  } catch (err) {
    return wari.make('FileError', {operation: 'write', filePath, error: err})
  }
}

async function main() {
  const data = wari.match(await fetchData(), {
    'HttpError': console.error,
    'JsonError': console.error
  })
  // if the result was an HttpError or JsonError, then `data` will be `undefined` (the result of console.error)
  if (!data) return;
  // otherwise `data` will be the returned data with the correct type 
  // ... transform data
  wari.match(await writeData('result.json', transformedData), {
    'FileError': console.error
  })
}
```

# API reference

...

# Contributing

You can contribute to this library in many ways, including:

- **Reporting bugs**: Simply open an issue and describe the bug. Please include a code snippet to reproduce the bug, it really helps to solve the problem quickly.

- **Suggesting new features**: If you have a feature idea or a use case that is not covered, open an issue and we will discuss it. Do you already have an implementation for it? great, make a pull request and I will review it.

Those are just examples, any issue or pull request is welcome :)

# Changelog

**1.0.0-alpha.1 (August 13 2023)**

- First alpha version.
