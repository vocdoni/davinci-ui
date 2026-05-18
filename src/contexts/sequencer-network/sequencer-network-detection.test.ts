import { describe, expect, it } from 'vitest'
import { normalizeInfoNetworks } from './sequencer-network-detection'

describe('normalizeInfoNetworks', () => {
  it('normalizes structured /info networks', () => {
    const normalized = normalizeInfoNetworks({
      networks: {
        sepolia: {
          chainID: 11155111,
          shortName: 'sepolia',
          processRegistryContract: '0x123',
          processIDVersion: 'v1',
        },
      },
    })

    expect(normalized).toEqual([
      {
        chainId: 11155111,
        shortName: 'sepolia',
        processRegistryContract: '0x123',
        processIDVersion: 'v1',
      },
    ])
  })

  it('normalizes legacy /info network shape', () => {
    const normalized = normalizeInfoNetworks({
      network: {
        sepolia: 11155111,
        arbitrum: '42161',
      },
    })

    expect(normalized).toEqual([
      {
        chainId: 11155111,
        shortName: 'sepolia',
        processRegistryContract: '',
        processIDVersion: '',
      },
      {
        chainId: 42161,
        shortName: 'arbitrum',
        processRegistryContract: '',
        processIDVersion: '',
      },
    ])
  })
})
