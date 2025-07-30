import { useCallback, useEffect, useState } from 'react'

interface VoteStorage {
  [address: string]: string
}

export function usePersistedVote(processId: string, address?: string) {
  const storageKey = `votes-${processId}`
  const legacyStorageKey = `vote-${processId}`

  const getStoredVoteId = useCallback((): string => {
    if (typeof window === 'undefined' || !address) return ''

    try {
      // Try new storage format first
      const storedData = localStorage.getItem(storageKey)
      if (storedData) {
        const voteStorage: VoteStorage = JSON.parse(storedData)
        return voteStorage[address] || ''
      }

      // Check for legacy format and migrate if found
      const legacyVoteId = localStorage.getItem(legacyStorageKey)
      if (legacyVoteId) {
        // Migrate legacy data to new format
        const voteStorage: VoteStorage = { [address]: legacyVoteId }
        localStorage.setItem(storageKey, JSON.stringify(voteStorage))
        localStorage.removeItem(legacyStorageKey)
        return legacyVoteId
      }

      return ''
    } catch {
      return ''
    }
  }, [address, storageKey, legacyStorageKey])

  const [voteId, setVoteId] = useState(getStoredVoteId)

  // Update voteId when address changes
  useEffect(() => {
    setVoteId(getStoredVoteId())
  }, [address, processId, getStoredVoteId])

  const trackVote = (newVoteId: string) => {
    if (!address) return

    setVoteId(newVoteId)
    try {
      const storedData = localStorage.getItem(storageKey)
      const voteStorage: VoteStorage = storedData ? JSON.parse(storedData) : {}
      voteStorage[address] = newVoteId
      localStorage.setItem(storageKey, JSON.stringify(voteStorage))
    } catch (error) {
      console.error('Failed to persist vote ID:', error)
    }
  }

  const resetVote = () => {
    if (!address) return

    setVoteId('')
    try {
      const storedData = localStorage.getItem(storageKey)
      if (storedData) {
        const voteStorage: VoteStorage = JSON.parse(storedData)
        delete voteStorage[address]

        // If no more addresses, remove the entire key
        if (Object.keys(voteStorage).length === 0) {
          localStorage.removeItem(storageKey)
        } else {
          localStorage.setItem(storageKey, JSON.stringify(voteStorage))
        }
      }
    } catch (error) {
      console.error('Failed to remove vote ID:', error)
    }
  }

  // Clean up old vote IDs if the vote status is final
  useEffect(() => {
    if (!voteId) return

    // Optional: You could check if the vote is settled/errored and clean up
    // This would require using the useVoteStatus hook here
  }, [voteId])

  return { voteId, trackVote, resetVote }
}
