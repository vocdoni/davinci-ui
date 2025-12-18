import { describe, expect, it } from 'vitest'

import { getNetworkName, truncateAddress } from './web3-utils'

describe('web3-utils', () => {
  describe('truncateAddress', () => {
    it('returns empty string for empty input', () => {
      expect(truncateAddress('')).toBe('')
    })

    it('truncates long addresses with defaults', () => {
      expect(truncateAddress('0x1234567890abcdef')).toBe('0x1234...cdef')
    })

    it('returns the original address if it is shorter than the requested truncation', () => {
      expect(truncateAddress('0x1234', 6, 4)).toBe('0x1234')
    })
  })

  describe('getNetworkName', () => {
    it('matches known hex chain ids', () => {
      expect(getNetworkName('0xaa36a7')).toBe('Sepolia')
    })

    it('converts decimal ids to hex', () => {
      expect(getNetworkName(1)).toBe('Ethereum Mainnet')
    })

    it('returns Unknown Network for unknown ids', () => {
      expect(getNetworkName('0xdeadbeef')).toBe('Unknown Network')
    })
  })
})

