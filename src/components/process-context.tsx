// ProcessContext.tsx
import { useAppKitAccount } from '@reown/appkit/react'
import { useQuery } from '@tanstack/react-query'
import type { CensusProof, ElectionMetadata, GetProcessResponse } from '@vocdoni/davinci-sdk'
import { createContext, useContext, useMemo, type FC, type PropsWithChildren } from 'react'
import { up } from 'up-fetch'
import { useVocdoniApi } from './vocdoni-api-context'

type Process = {
  process: GetProcessResponse
  meta: ElectionMetadata
}

interface ProcessContextValue {
  process: Process
  censusProof: CensusProof | null
  hasVoted: boolean | null
  isHasVotedLoading: boolean
  isHasVotedError: boolean
  hasVotedError: Error | null
  isAbleToVote?: boolean
  isCreator: boolean
  isInCensus: boolean | null
  isCensusProofLoading: boolean
  isCensusProofError: boolean
  censusProofError: Error | null
}

const ProcessContext = createContext<ProcessContextValue | undefined>(undefined)

type ProcessProviderProps = PropsWithChildren<{ process: Process }>

const upfetch = up(fetch)

export const ProcessProvider: FC<ProcessProviderProps> = ({ children, process }) => {
  const api = useVocdoniApi()
  const { address, isConnected } = useAppKitAccount()
  const censusRoot = process.process.census.censusRoot

  const {
    data: censusProof,
    isLoading: isCensusProofLoading,
    isError: isCensusProofError,
    error: censusProofError,
  } = useQuery({
    enabled: !!address && !!censusRoot,
    queryKey: ['census-proof', censusRoot, address],
    queryFn: async () => {
      if (process.process.census.censusURI.startsWith('http')) {
        return await upfetch<CensusProof>(`${process.process.census.censusURI}/proof`, {
          params: { key: address },
        })
      }
      return await api.getCensusProof(censusRoot, address!)
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
    enabled: !!address && !!process.process.id,
    queryKey: ['has-voted', process.process.id, address],
    queryFn: async () => {
      return await api.hasAddressVoted(process.process.id, address!)
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  })

  const isInCensus = address ? (isCensusProofLoading ? null : !isCensusProofError) : null

  const value = useMemo<ProcessContextValue>(
    () => ({
      process,
      censusProof: censusProof ?? null,
      censusProofError,
      hasVoted: address ? (isHasVotedLoading ? null : Boolean(hasVoted)) : null,
      hasVotedError,
      isAbleToVote: Boolean(isInCensus) && process.process.isAcceptingVotes,
      isCensusProofError,
      isCensusProofLoading,
      isCreator: process.process.organizationId === address,
      isHasVotedError,
      isHasVotedLoading,
      isInCensus,
    }),
    [process, censusProof, isInCensus, isCensusProofLoading, isCensusProofError]
  )

  return <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>
}

export const useProcess = (): ProcessContextValue => {
  const context = useContext(ProcessContext)
  if (!context) {
    throw new Error('useProcess must be used within a ProcessProvider')
  }
  return context
}
