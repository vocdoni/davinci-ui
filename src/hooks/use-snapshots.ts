import { useQuery } from '@tanstack/react-query'
import { up } from 'up-fetch'

const upfetch = up(fetch)

export type Snapshot = {
  snapshotDate: string // ISO date string
  censusRoot: string
  participantCount: number
  minBalance: number
  displayName?: string
  displayAvatar?: string
  queryName: string
  createdAt: string // ISO date string
  weightStrategy: string
}

export type SnapshotsResponse = {
  snapshots: Snapshot[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

export function useSnapshots() {
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: async () => {
      const response = await upfetch<SnapshotsResponse>(`${import.meta.env.CENSUS3_URL}/snapshots`)
      return response.snapshots || []
    },
  })
}
