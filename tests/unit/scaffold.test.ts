import { describe, expect, it } from 'vite-plus/test'
import { is } from '../../src/index.js'

describe('is', () => {
  it('recognizes matching constructor instances', () => {
    expect(is(Date, new Date())).toBe(true)
    expect(is(Date, new Map())).toBe(false)
  })
})
