import type { AppKitNetwork } from '@reown/appkit/networks'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SequencerNetworkProvider, useSequencerNetwork } from './sequencer-network-context'

const { getSequencerNetworkAsyncMock, getSequencerInfoNetworksMock, getNetworkByChainIdMock } = vi.hoisted(() => ({
  getSequencerNetworkAsyncMock: vi.fn(),
  getSequencerInfoNetworksMock: vi.fn(),
  getNetworkByChainIdMock: vi.fn(),
}))

vi.mock('./network-config', () => ({
  getSequencerNetworkAsync: getSequencerNetworkAsyncMock,
  getNetworkByChainId: getNetworkByChainIdMock,
}))

vi.mock('./sequencer-network-detection', () => ({
  getSequencerInfoNetworks: getSequencerInfoNetworksMock,
}))

const sepoliaNetwork = { id: 11155111, name: 'Sepolia' } as AppKitNetwork
const arbitrumSepoliaNetwork = { id: 421614, name: 'Arbitrum Sepolia' } as AppKitNetwork

function Probe() {
  const { selectedSequencerNetwork, availableSequencerNetworkOptions } = useSequencerNetwork()

  return (
    <>
      <div data-testid='selected-chain'>{selectedSequencerNetwork ? String(selectedSequencerNetwork.id) : 'null'}</div>
      <div data-testid='options-count'>{String(availableSequencerNetworkOptions.length)}</div>
    </>
  )
}

describe('SequencerNetworkProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('uses persisted chain id when available and valid', async () => {
    window.localStorage.setItem('davinci.selectedSequencerChainId', '421614')
    getSequencerNetworkAsyncMock.mockResolvedValue(sepoliaNetwork)
    getSequencerInfoNetworksMock.mockResolvedValue([{ chainId: 11155111 }, { chainId: 421614 }])
    getNetworkByChainIdMock.mockImplementation((chainId: number) => {
      if (chainId === 11155111) return sepoliaNetwork
      if (chainId === 421614) return arbitrumSepoliaNetwork
      return null
    })

    render(
      <SequencerNetworkProvider>
        <Probe />
      </SequencerNetworkProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected-chain').textContent).toBe('421614')
    })
    expect(screen.getByTestId('options-count').textContent).toBe('2')
  })

  it('falls back to default network when persisted value is invalid', async () => {
    window.localStorage.setItem('davinci.selectedSequencerChainId', 'not-a-number')
    getSequencerNetworkAsyncMock.mockResolvedValue(sepoliaNetwork)
    getSequencerInfoNetworksMock.mockResolvedValue([{ chainId: 11155111 }])
    getNetworkByChainIdMock.mockImplementation((chainId: number) => (chainId === 11155111 ? sepoliaNetwork : null))

    render(
      <SequencerNetworkProvider>
        <Probe />
      </SequencerNetworkProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected-chain').textContent).toBe('11155111')
    })
    expect(window.localStorage.getItem('davinci.selectedSequencerChainId')).toBeNull()
  })

  it('continues loading when localStorage read throws', async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    getSequencerNetworkAsyncMock.mockResolvedValue(sepoliaNetwork)
    getSequencerInfoNetworksMock.mockResolvedValue([{ chainId: 11155111 }])
    getNetworkByChainIdMock.mockImplementation((chainId: number) => (chainId === 11155111 ? sepoliaNetwork : null))

    render(
      <SequencerNetworkProvider>
        <Probe />
      </SequencerNetworkProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('selected-chain').textContent).toBe('11155111')
    })

    getItemSpy.mockRestore()
  })
})
