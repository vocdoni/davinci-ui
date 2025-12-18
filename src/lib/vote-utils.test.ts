import { describe, expect, it } from 'vitest'

import { getBinaryArray, padTo } from './vote-utils'

describe('vote-utils', () => {
  describe('getBinaryArray', () => {
    it('returns an array of length 8 with 1s in the selected positions', () => {
      expect(getBinaryArray(['0', '3'])).toEqual([1, 0, 0, 1, 0, 0, 0, 0])
    })

    it('uses the provided numeric value', () => {
      expect(getBinaryArray(['1', '7'], 5)).toEqual([0, 5, 0, 0, 0, 0, 0, 5])
    })

    it('ignores invalid positions', () => {
      expect(getBinaryArray(['-1', '8', 'foo', '2'])).toEqual([0, 0, 1, 0, 0, 0, 0, 0])
    })
  })

  describe('padTo', () => {
    it('pads an array with zeros up to length', () => {
      expect(padTo([1, 2], 5)).toEqual([1, 2, 0, 0, 0])
    })

    it('truncates an array down to length', () => {
      expect(padTo([1, 2, 3, 4], 2)).toEqual([1, 2])
    })
  })
})

