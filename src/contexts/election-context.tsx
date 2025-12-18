import { useQuery, type QueryObserverResult } from '@tanstack/react-query'
import type { CensusProof } from '@vocdoni/davinci-sdk'
import { ProcessStatus } from '@vocdoni/davinci-sdk'
import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react'
import { getProcessQuery } from '~hooks/use-process-query'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'
import type { Process } from '~src/types'
import { useVocdoniApi } from './vocdoni-api-context'

interface ElectionProviderProps {
  electionId: string
  election?: Process
  fetchCensus?: boolean
  children: ReactNode
}

const ENDED_STATUSES = [ProcessStatus.ENDED, ProcessStatus.CANCELED, ProcessStatus.RESULTS] as const

type ElectionContextArgs = Omit<ElectionProviderProps, 'children'>

const useElectionProvider = ({ electionId, election: process, fetchCensus = false }: ElectionContextArgs) => {
  const { api } = useVocdoniApi()
  const { address } = useUnifiedWallet()

  const {
    data: election,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...getProcessQuery(electionId, api),
    initialData: process, // Seed with loader data to avoid duplicate fetch
    refetchInterval: 30_000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Pause when tab is not focused
  })

  // Status-related computed values
  const status = useMemo(() => election?.process.status ?? null, [election])

  const voteHasEnded = useMemo(() => (status !== null ? ENDED_STATUSES.includes(status) : false), [status])

  const isAcceptingVotes = useMemo(() => election?.process.isAcceptingVotes ?? false, [election])

  const isPaused = useMemo(() => status === ProcessStatus.PAUSED, [status])

  const wasCanceled = useMemo(() => status === ProcessStatus.CANCELED, [status])

  const hasResults = useMemo(() => status === ProcessStatus.RESULTS, [status])

  // Time-related computed values
  const voteStartTime = useMemo(() => (election ? new Date(election.process.startTime) : null), [election])

  const voteEndTime = useMemo(() => {
    if (!election) return null
    return new Date(new Date(election.process.startTime).getTime() + election.process.duration / 1_000_000)
  }, [election])

  const timeRemainingMs = useMemo(() => {
    if (!voteEndTime) return 0
    return voteEndTime.getTime() - Date.now()
  }, [voteEndTime])

  const isNearingEnd = useMemo(() => timeRemainingMs > 0 && timeRemainingMs < 5 * 60 * 1000, [timeRemainingMs])

  // Vote count values
  const uniqueVoters = election ? Number(election.process.votersCount) : 0
  const overwrittenVotes = election ? Number(election.process.overwrittenVotesCount) : 0

  // Census-related queries (only when fetchCensus=true)
  const processId = election?.process.id

  const {
    data: isAddressAbleToVote,
    isLoading: isEligibilityLoading,
    isError: isEligibilityError,
  } = useQuery({
    enabled: fetchCensus && !!address && !!processId,
    queryKey: ['is-address-able-to-vote', processId, address],
    queryFn: async () => await api.sequencer.isAddressAbleToVote(processId!, address!),
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  })

  const {
    data: hasVoted,
    isLoading: isHasVotedLoading,
    isError: isHasVotedError,
    error: hasVotedError,
  } = useQuery({
    enabled: fetchCensus && !!address && !!election?.process.id,
    queryKey: ['has-voted', election?.process.id, address],
    queryFn: async () => {
      return await api.sequencer.hasAddressVoted(election!.process.id, address!)
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  })

  const isCensusProofLoading = fetchCensus && !!address ? isEligibilityLoading : false

  const isInCensus =
    fetchCensus && address
      ? isCensusProofLoading
        ? null
        : isEligibilityError
          ? false
          : Boolean(isAddressAbleToVote)
      : null

  const isCreator = election?.process.organizationId?.toLowerCase() === address?.toLowerCase()

  return {
    election,
    isLoading,
    error,
    refetch,
    // Status values
    voteHasEnded,
    isAcceptingVotes,
    isPaused,
    wasCanceled,
    hasResults,
    status,
    // Time values
    voteStartTime,
    voteEndTime,
    timeRemainingMs,
    isNearingEnd,
    // Vote count values
    uniqueVoters,
    overwrittenVotes,
    // Census and voting status
    censusProof: null as CensusProof | null,
    hasVoted: fetchCensus && address ? (isHasVotedLoading ? null : Boolean(hasVoted)) : null,
    isHasVotedLoading,
    isHasVotedError,
    hasVotedError,
    isAbleToVote: Boolean(isInCensus) && isAcceptingVotes,
    isCreator,
    isInCensus,
    isCensusProofLoading,
    isCensusProofError: false as boolean,
    censusProofError: null as Error | null,
  }
}

export interface ElectionContextValue extends ReturnType<typeof useElectionProvider> {
  refetch: () => Promise<QueryObserverResult<Process, Error>>
}

const ElectionContext = createContext<ElectionContextValue | undefined>(undefined)

export const ElectionProvider: FC<ElectionProviderProps> = ({
  electionId,
  election: process,
  fetchCensus = false,
  children,
}) => {
  const value = useElectionProvider({ electionId, election: process, fetchCensus })

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>
}

export const useElection = (): ElectionContextValue => {
  const context = useContext(ElectionContext)
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider')
  }
  return context
}
