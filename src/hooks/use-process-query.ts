import { useQuery } from '@tanstack/react-query'
import type { ElectionMetadata, VocdoniApiService } from '@vocdoni/davinci-sdk'
import { getElectionMetadataTemplate } from '@vocdoni/davinci-sdk'
import { useEffect } from 'react'
import { up } from 'up-fetch'
import { useVocdoniApi } from '~contexts/vocdoni-api-context'

const upfetch = up(fetch)

export const getProcessQuery = (id: string, api: VocdoniApiService) => ({
  queryKey: ['process', id],
  queryFn: async (): Promise<Process> => {
    const process = await api.sequencer.getProcess(id)
    if (!process) throw new Error('Vote not found')

    let meta: ElectionMetadata = getElectionMetadataTemplate()
    try {
      meta = await upfetch<ElectionMetadata>(process.metadataURI)
    } catch (err) {
      console.warn(`Could not fetch metadata for process ${id}:`, err)
    }

    return { process, meta }
  },
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: true,
})

export const useProcessQuery = (id: string) => {
  const { api } = useVocdoniApi()
  const query = useQuery(getProcessQuery(id, api))

  const isAcceptingVotes = query.data?.process.isAcceptingVotes

  useEffect(() => {
    if (!isAcceptingVotes) return

    const interval = setInterval(() => {
      query.refetch()
    }, 10_000)

    return () => clearInterval(interval)
  }, [isAcceptingVotes, query])

  return query
}

/**
 * React Query hook to fetch the list of process IDs from Vocdoni API.
 *
 * It uses `api.listProcesses()` which returns:
 * ```ts
 * export interface ListProcessesResponse {
 *   processes: string[];
 * }
 * ```
 *
 * This hook will directly return `string[]`, not the wrapped object.
 */
export const useProcessList = () => {
  const { api } = useVocdoniApi()

  return useQuery<string[]>({
    queryKey: ['processList'],
    queryFn: async () => await api.sequencer.listProcesses(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  })
}
