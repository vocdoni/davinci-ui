// ProcessContext.tsx
import { useQuery } from '@tanstack/react-query'
import type { CensusProof, ElectionMetadata, GetProcessResponse } from '@vocdoni/davinci-sdk'
import { useConnectWallet } from '@web3-onboard/react'
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
  isAbleToVote?: boolean
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
  const [{ wallet }] = useConnectWallet()

  const address = wallet?.accounts?.[0]?.address ?? null
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

  const isInCensus = address ? (isCensusProofLoading ? null : !isCensusProofError) : null

  const value = useMemo<ProcessContextValue>(
    () => ({
      process,
      isAbleToVote: Boolean(isInCensus) && process.process.isAcceptingVotes,
      isInCensus,
      censusProof: censusProof ?? null,
      censusProofError,
      isCensusProofLoading,
      isCensusProofError,
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
