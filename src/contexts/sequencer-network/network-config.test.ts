import { describe, expect, it } from 'vitest'
import { getNetworkByChainId } from './network-config'

describe('getNetworkByChainId', () => {
  it('returns a known network when chain id is supported', () => {
    const sepolia = getNetworkByChainId(11155111)
    expect(sepolia?.name).toBe('Sepolia')
  })

  it('returns null when chain id is unsupported', () => {
    expect(getNetworkByChainId(99999999)).toBeNull()
  })
})
