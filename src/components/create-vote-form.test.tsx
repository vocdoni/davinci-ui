import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CreateVoteForm } from './create-vote-form'

vi.mock('~contexts/vocdoni-api-context', () => ({
  useVocdoniApi: () => ({
    api: {
      sequencer: {
        getMetadataUrl: vi.fn(),
        getProcess: vi.fn(),
        pushMetadata: vi.fn(),
      },
    },
    sdk: null,
  }),
}))

vi.mock('~hooks/use-snapshots', () => ({
  useSnapshots: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('~hooks/use-unified-wallet', () => ({
  useUnifiedWallet: () => ({
    address: '0x0000000000000000000000000000000000000000',
    isConnected: false,
  }),
}))

vi.mock('~contexts/MiniAppContext', () => ({
  useMiniApp: () => ({
    isMiniApp: false,
    isExternalWallet: false,
    supportedChains: [],
    getFarcasterEthereumProvider: vi.fn(),
  }),
}))

vi.mock('~contexts/sequencer-network', () => ({
  useSequencerNetwork: () => ({
    sequencerNetwork: { name: 'Sepolia' },
  }),
}))

vi.mock('@reown/appkit/react', () => ({
  useAppKitNetwork: () => ({
    caipNetwork: null,
  }),
}))

vi.mock('./snapshots', () => ({
  Snapshots: () => <div data-testid='snapshots' />,
}))

vi.mock('./ui/connect-wallet-button-miniapp', () => ({
  default: () => <div data-testid='connect-wallet' />,
}))

const renderForm = () =>
  render(
    <MemoryRouter>
      <CreateVoteForm />
    </MemoryRouter>
  )

describe('CreateVoteForm', () => {
  it('shows max voters only for prebuilt and advanced censuses', () => {
    renderForm()

    expect(screen.queryByLabelText(/max voters/i)).toBeNull()

    fireEvent.click(screen.getByLabelText(/prebuilt censuses/i))
    expect(screen.queryByLabelText(/max voters/i)).not.toBeNull()

    fireEvent.click(screen.getByLabelText(/advanced/i))
    expect(screen.queryByLabelText(/max voters/i)).not.toBeNull()

    fireEvent.click(screen.getByLabelText(/custom addresses/i))
    expect(screen.queryByLabelText(/max voters/i)).toBeNull()
  })

  it('clears max voters when switching census types', () => {
    renderForm()

    fireEvent.click(screen.getByLabelText(/advanced/i))
    const maxVotersInput = screen.getByLabelText(/max voters/i) as HTMLInputElement
    fireEvent.change(maxVotersInput, { target: { value: '123' } })
    expect(maxVotersInput.value).toBe('123')

    fireEvent.click(screen.getByLabelText(/custom addresses/i))
    fireEvent.click(screen.getByLabelText(/advanced/i))
    expect((screen.getByLabelText(/max voters/i) as HTMLInputElement).value).toBe('')
  })
})
