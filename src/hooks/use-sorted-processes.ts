/* eslint-disable no-case-declarations */
import { useCallback, useMemo, useState } from 'react'

export interface ProcessSortData {
  createdAt?: number
  votersCount?: number
  title?: string
  organizationId?: string
}

export type SortBy = 'createdAt' | 'votersCount' | 'title'

export const useSortedProcesses = (processIds: string[], sortBy: SortBy = 'createdAt') => {
  const [processDataMap, setProcessDataMap] = useState<Map<string, ProcessSortData>>(new Map())

  const registerProcessData = useCallback((id: string, data: ProcessSortData) => {
    setProcessDataMap((prev) => {
      const newMap = new Map(prev)
      newMap.set(id, data)
      return newMap
    })
  }, [])

  const sortedIds = useMemo(() => {
    if (!processIds?.length) return []

    // Separate loaded and unloaded processes
    const loadedProcesses: Array<{ id: string; data: ProcessSortData }> = []
    const unloadedProcesses: string[] = []

    processIds.forEach((id) => {
      const data = processDataMap.get(id)
      if (data) {
        loadedProcesses.push({ id, data })
      } else {
        unloadedProcesses.push(id)
      }
    })

    // Sort loaded processes based on sortBy criteria
    loadedProcesses.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          // Sort by creation time (newest first)
          const timeA = a.data.createdAt || 0
          const timeB = b.data.createdAt || 0
          return timeB - timeA

        case 'votersCount':
          // Sort by vote count (highest first)
          const votesA = a.data.votersCount || 0
          const votesB = b.data.votersCount || 0
          return votesB - votesA

        case 'title':
          // Sort by title (alphabetical)
          const titleA = a.data.title || ''
          const titleB = b.data.title || ''
          return titleA.localeCompare(titleB)

        default:
          return 0
      }
    })

    // Return sorted loaded processes first, then unloaded ones
    return [...loadedProcesses.map((p) => p.id), ...unloadedProcesses]
  }, [processIds, processDataMap, sortBy])

  return {
    sortedIds,
    registerProcessData,
    loadedCount: processDataMap.size,
    totalCount: processIds?.length || 0,
  }
}
