import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Process } from '~src/types'
import { ElectionProvider, useElection } from './election-context'

let walletAddress: string | undefined = '0x0000000000000000000000000000000000000001'
let currentElection: Process | undefined

const isAddressAbleToVoteMock = vi.fn<(processId: string, address: string) => Promise<boolean>>()
const hasAddressVotedMock = vi.fn<(processId: string, address: string) => Promise<boolean>>()

vi.mock('~hooks/use-unified-wallet', () => ({
  useUnifiedWallet: () => ({
    address: walletAddress,
    isConnected: Boolean(walletAddress),
  }),
}))

vi.mock('./vocdoni-api-context', () => ({
  useVocdoniApi: () => ({
    api: {
      sequencer: {
        isAddressAbleToVote: isAddressAbleToVoteMock,
        hasAddressVoted: hasAddressVotedMock,
      },
    },
    sdk: null,
  }),
}))

vi.mock('~hooks/use-process-query', () => ({
  getProcessQuery: (id: string) => ({
    queryKey: ['process', id],
    queryFn: async () => currentElection,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  }),
}))

function TestConsumer() {
  const { isInCensus, isCensusProofLoading, isAbleToVote } = useElection()
  return (
    <div>
      <div data-testid='isInCensus'>{String(isInCensus)}</div>
      <div data-testid='isCensusProofLoading'>{String(isCensusProofLoading)}</div>
      <div data-testid='isAbleToVote'>{String(isAbleToVote)}</div>
    </div>
  )
}

function createElection(overrides: Partial<Process> = {}): Process {
  const base = {
    process: {
      id: '0xprocess',
      status: 0,
      isAcceptingVotes: true,
      organizationId: walletAddress ?? '0xorg',
      startTime: new Date().toISOString(),
      duration: 60_000_000_000,
      votersCount: '0',
      overwrittenVotesCount: '0',
      census: { censusRoot: '0xroot', censusURI: 'ipfs://census' },
      ballotMode: { costFromWeight: false },
    },
    meta: { type: { name: 'MULTIPLE_CHOICE' }, questions: [{ choices: [] }] },
  }

  return { ...(base as unknown as Process), ...overrides }
}

function renderElection(fetchCensus: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  currentElection = createElection()

  render(
    <QueryClientProvider client={queryClient}>
      <ElectionProvider electionId='0xprocess' election={currentElection} fetchCensus={fetchCensus}>
        <TestConsumer />
      </ElectionProvider>
    </QueryClientProvider>
  )
}

describe('ElectionContext', () => {
  beforeEach(() => {
    isAddressAbleToVoteMock.mockReset()
    hasAddressVotedMock.mockReset()
    walletAddress = '0x0000000000000000000000000000000000000001'
  })

  it('returns null isInCensus when fetchCensus is false', () => {
    renderElection(false)

    expect(screen.getByTestId('isInCensus').textContent).toBe('null')
    expect(screen.getByTestId('isCensusProofLoading').textContent).toBe('false')
  })

  it('returns null isInCensus when there is no connected address', () => {
    walletAddress = undefined
    renderElection(true)

    expect(screen.getByTestId('isInCensus').textContent).toBe('null')
    expect(screen.getByTestId('isCensusProofLoading').textContent).toBe('false')
  })

  it('sets isInCensus to null while eligibility is loading, then true when eligible', async () => {
    let resolveEligibility: (v: boolean) => void
    const eligibilityPromise = new Promise<boolean>((resolve) => {
      resolveEligibility = resolve
    })

    isAddressAbleToVoteMock.mockImplementationOnce(async () => await eligibilityPromise)
    hasAddressVotedMock.mockResolvedValueOnce(false)

    renderElection(true)

    expect(screen.getByTestId('isCensusProofLoading').textContent).toBe('true')
    expect(screen.getByTestId('isInCensus').textContent).toBe('null')

    resolveEligibility!(true)

    await waitFor(() => {
      expect(screen.getByTestId('isCensusProofLoading').textContent).toBe('false')
      expect(screen.getByTestId('isInCensus').textContent).toBe('true')
      expect(screen.getByTestId('isAbleToVote').textContent).toBe('true')
    })
  })

  it('sets isInCensus to false when not eligible', async () => {
    isAddressAbleToVoteMock.mockResolvedValueOnce(false)
    hasAddressVotedMock.mockResolvedValueOnce(false)

    renderElection(true)

    await waitFor(() => {
      expect(screen.getByTestId('isInCensus').textContent).toBe('false')
      expect(screen.getByTestId('isAbleToVote').textContent).toBe('false')
    })
  })

  it('sets isInCensus to false on eligibility error', async () => {
    isAddressAbleToVoteMock.mockRejectedValueOnce(new Error('boom'))
    hasAddressVotedMock.mockResolvedValueOnce(false)

    renderElection(true)

    await waitFor(() => {
      expect(screen.getByTestId('isInCensus').textContent).toBe('false')
    })
  })
})
