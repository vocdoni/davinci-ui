import { useQuery } from '@tanstack/react-query'
import type { ElectionMetadata } from '@vocdoni/davinci-sdk'
import { useEffect } from 'react'
import { up } from 'up-fetch'
import { useVocdoniApi } from '~components/vocdoni-api-context'
import type { Process } from '~src/types'

const upfetch = up(fetch)

// Define la query genérica
export const getProcessQuery = (id: string, api: ReturnType<typeof useVocdoniApi>) => ({
  queryKey: ['process', id],
  queryFn: async (): Promise<Process> => {
    const process = await api.getProcess(id)
    if (!process) throw new Error('Vote not found')

    const meta = await upfetch<ElectionMetadata>(process.metadataURI)
    return { process, meta }
  },
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: true,
})

export const useProcessQuery = (id: string) => {
  const api = useVocdoniApi()
  const query = useQuery(getProcessQuery(id, api))

  const isAcceptingVotes = query.data?.process.isAcceptingVotes

  useEffect(() => {
    if (!isAcceptingVotes) return

    const interval = setInterval(() => {
      query.refetch()
    }, 10_000)

    return () => clearInterval(interval)
  }, [isAcceptingVotes, query.refetch])

  return query
}
