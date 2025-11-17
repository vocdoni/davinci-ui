import { useQuery, type QueryObserverResult } from '@tanstack/react-query'
import type { CensusProof } from '@vocdoni/davinci-sdk'
import { ProcessStatus } from '@vocdoni/davinci-sdk'
import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react'
import { up } from 'up-fetch'
import { getProcessQuery } from '~hooks/use-process-query'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'
import type { Process } from '~src/types'
import { useVocdoniApi } from './vocdoni-api-context'

const upfetch = up(fetch)

interface ElectionContextValue {
  election: Process | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<QueryObserverResult<Process, Error>>
  // Status-related computed values
  voteHasEnded: boolean
  isAcceptingVotes: boolean
  isPaused: boolean
  wasCanceled: boolean
  hasResults: boolean
  status: ProcessStatus | null
  // Time-related computed values
  voteStartTime: Date | null
  voteEndTime: Date | null
  timeRemainingMs: number
  isNearingEnd: boolean
  // Vote count computed values
  uniqueVoters: number
  totalVotesCast: number
  overwrittenVotes: number
  // Census and voting status (only when fetchCensus=true)
  censusProof: CensusProof | null
  hasVoted: boolean | null
  isHasVotedLoading: boolean
  isHasVotedError: boolean
  hasVotedError: Error | null
  isAbleToVote: boolean
  isCreator: boolean
  isInCensus: boolean | null
  isCensusProofLoading: boolean
  isCensusProofError: boolean
  censusProofError: Error | null
}

const ElectionContext = createContext<ElectionContextValue | undefined>(undefined)

interface ElectionProviderProps {
  electionId: string
  election?: Process
  fetchCensus?: boolean
  children: ReactNode
}

const ENDED_STATUSES = [ProcessStatus.ENDED, ProcessStatus.CANCELED, ProcessStatus.RESULTS] as const

export const ElectionProvider: FC<ElectionProviderProps> = ({
  electionId,
  election: process,
  fetchCensus = false,
  children,
}) => {
  const api = useVocdoniApi()
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
  const totalVotesCast = election ? Number(election.process.voteCount) : 0
  const overwrittenVotes = election ? Number(election.process.voteOverwrittenCount) : 0
  const uniqueVoters = totalVotesCast - overwrittenVotes

  // Census-related queries (only when fetchCensus=true)
  const censusRoot = election?.process.census.censusRoot

  const {
    data: censusProof,
    isLoading: isCensusProofLoading,
    isError: isCensusProofError,
    error: censusProofError,
  } = useQuery({
    enabled: fetchCensus && !!address && !!censusRoot,
    queryKey: ['census-proof', censusRoot, address],
    queryFn: async () => {
      if (election!.process.census.censusURI.startsWith('http')) {
        return await upfetch<CensusProof>(`${election!.process.census.censusURI}/proof`, {
          params: { key: address },
        })
      }
      return await api.census.getCensusProof(censusRoot!, address!)
    },
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

  const isInCensus = fetchCensus && address ? (isCensusProofLoading ? null : !isCensusProofError) : null
  const isCreator = election?.process.organizationId === address

  const value: ElectionContextValue = {
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
    totalVotesCast,
    overwrittenVotes,
    // Census and voting status
    censusProof: censusProof ?? null,
    hasVoted: fetchCensus && address ? (isHasVotedLoading ? null : Boolean(hasVoted)) : null,
    isHasVotedLoading,
    isHasVotedError,
    hasVotedError,
    isAbleToVote: Boolean(isInCensus) && isAcceptingVotes,
    isCreator,
    isInCensus,
    isCensusProofLoading,
    isCensusProofError,
    censusProofError,
  }

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>
}

export const useElection = (): ElectionContextValue => {
  const context = useContext(ElectionContext)
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider')
  }
  return context
}
