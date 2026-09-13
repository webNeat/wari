import { expect, expectTypeOf, it, test } from 'vite-plus/test'
import { match } from './match.js'

class Left {
  left = true
}
class Right {
  right = true
}

class SameShapeLeft {
  value = true
}
class SameShapeRight {
  value = true
}

class First {
  first = 1
}
class Second {
  second = 'two' as const
}
class Third {
  third = true
}
class Fourth {
  fourth = 4n
}
class Fifth {
  fifth = Symbol('five')
}
class Sixth {
  sixth = undefined
}
class Seventh {
  seventh = null
}
class Eighth {
  eighth = { eight: 8 }
}
class Ninth {
  ninth = [9]
}
class Tenth {
  tenth = new Date()
}
class Eleventh {
  eleventh = Promise.resolve(11)
}
class Twelfth {
  twelfth = /twelve/
}
class Unmatched {
  unmatched = true
}
abstract class Abstract {
  abstract abstractField: string
}

test('types', () => {
  const value = new First() as
    | First
    | Second
    | Third
    | Fourth
    | Fifth
    | Sixth
    | Seventh
    | Eighth
    | Ninth
    | Tenth
    | Eleventh
    | Twelfth
    | Unmatched
    | 'untouched'
  const output = match(
    value,
    {
      on: First,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<First>()
        // @ts-expect-error the handler receives only First
        void item.second
        return item.first
      },
    },
    {
      on: Second,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Second>()
        // @ts-expect-error the handler receives only Second
        void item.third
        return item.second
      },
    },
    {
      on: Third,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Third>()
        // @ts-expect-error the handler receives only Third
        void item.fourth
        return item.third
      },
    },
    {
      on: Fourth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Fourth>()
        // @ts-expect-error the handler receives only Fourth
        void item.fifth
        return item.fourth
      },
    },
    {
      on: Fifth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Fifth>()
        // @ts-expect-error the handler receives only Fifth
        void item.sixth
        return item.fifth
      },
    },
    {
      on: Sixth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Sixth>()
        // @ts-expect-error the handler receives only Sixth
        void item.seventh
        return item.sixth
      },
    },
    {
      on: Seventh,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Seventh>()
        // @ts-expect-error the handler receives only Seventh
        void item.eighth
        return item.seventh
      },
    },
    {
      on: Eighth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Eighth>()
        // @ts-expect-error the handler receives only Eighth
        void item.ninth
        return item.eighth
      },
    },
    {
      on: Ninth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Ninth>()
        // @ts-expect-error the handler receives only Ninth
        void item.tenth
        return item.ninth
      },
    },
    {
      on: Tenth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Tenth>()
        // @ts-expect-error the handler receives only Tenth
        void item.eleventh
        return item.tenth
      },
    },
    {
      on: Eleventh,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Eleventh>()
        // @ts-expect-error the handler receives only Eleventh
        void item.twelfth
        return item.eleventh
      },
    },
    {
      on: Twelfth,
      do: (item) => {
        expectTypeOf(item).toEqualTypeOf<Twelfth>()
        // @ts-expect-error the handler receives only Twelfth
        void item.first
        return item.twelfth
      },
    },
  )
  expectTypeOf(output).toEqualTypeOf<
    | number
    | 'two'
    | 'untouched'
    | boolean
    | bigint
    | symbol
    | undefined
    | null
    | { eight: number }
    | number[]
    | Date
    | Promise<number>
    | RegExp
    | Unmatched
  >()
  const both = match(new Right() as Left | Right, { on: Left, do: (item) => item.left }, { on: Right, do: (item) => item.right })
  expectTypeOf(both).toEqualTypeOf<boolean>()
  expectTypeOf(match(new Left(), { on: Left, do: (item) => item.left })).toEqualTypeOf<boolean>()
  expectTypeOf(match('text')).toEqualTypeOf<string>()
  expectTypeOf(match(new Left(), { on: Abstract, do: (item) => item.abstractField })).toEqualTypeOf<string | Left>()
  expectTypeOf(match('text', ...([] as const))).toEqualTypeOf<string>()
})

it('uses the first matching case and passes through unmatched values', () => {
  const value = new TypeError('failed')
  const calls: string[] = []
  expect(
    match(
      value,
      {
        on: Error,
        do: (error) => {
          calls.push('first')
          return error.message
        },
      },
      {
        on: TypeError,
        do: () => {
          calls.push('second')
          return 'later'
        },
      },
    ),
  ).toBe('failed')
  expect(calls).toEqual(['first'])
  const other = new Left()
  expect(match(other, { on: Right, do: () => 'right' })).toBe(other)
})

it('uses constructor identity for classes with identical instance shapes', () => {
  const value = new SameShapeRight()
  expect(match(value, { on: SameShapeLeft, do: () => 'left' })).toBe(value)
  expect(match(value, { on: SameShapeLeft, do: () => 'left' }, { on: SameShapeRight, do: () => 'right' })).toBe('right')
})

it('returns handler promises unchanged and propagates exceptions', async () => {
  const promise = Promise.resolve('value')
  expect(match(new Left(), { on: Left, do: () => promise })).toBe(promise)
  const failure = new Error('handler')
  expect(() =>
    match(new Left(), {
      on: Left,
      do: () => {
        throw failure
      },
    }),
  ).toThrow(failure)
})
