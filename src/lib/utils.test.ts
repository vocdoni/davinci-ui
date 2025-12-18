import { describe, expect, it } from 'vitest'

import { cn, enumToReverseObject, formatInterval, formatNanosecondsInterval, truncateText } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind conflicting classes', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('supports conditional values', () => {
      const shouldInclude = false
      expect(cn('a', shouldInclude && 'b', undefined, null, 'c')).toBe('a c')
    })
  })

  describe('truncateText', () => {
    it('returns the original string when under the limit', () => {
      expect(truncateText('hello', 10)).toBe('hello')
    })

    it('truncates and appends ellipsis by default', () => {
      expect(truncateText('hello world', 8)).toBe('hello...')
    })

    it('uses a custom ellipsis', () => {
      expect(truncateText('hello world', 8, '…')).toBe('hello w…')
    })

    it('truncates ellipsis itself when limit is shorter than ellipsis', () => {
      expect(truncateText('hello world', 2, '...')).toBe('..')
    })
  })

  describe('formatInterval', () => {
    it('formats milliseconds into a human readable string', () => {
      expect(formatInterval(0)).toBe('')
      expect(formatInterval(1000)).toBe('1 second')
      expect(formatInterval(61_000)).toBe('1 minute 1 second')
    })
  })

  describe('formatNanosecondsInterval', () => {
    it('converts nanoseconds to milliseconds before formatting', () => {
      expect(formatNanosecondsInterval(1_000_000_000)).toBe('1 second')
    })
  })

  describe('enumToReverseObject', () => {
    it('builds a numeric reverse map from a TS numeric enum-like object', () => {
      const enumLike = { 0: 'A', 1: 'B', A: 0, B: 1 } as const
      expect(enumToReverseObject(enumLike)).toEqual({ 0: 'A', 1: 'B' })
    })
  })
})
