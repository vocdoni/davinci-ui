import { useEffect, useState } from 'react'

export function usePersistedVote(processId: string) {
  const storageKey = `vote-${processId}`

  const [voteId, setVoteId] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      const stored = localStorage.getItem(storageKey)
      return stored || ''
    } catch {
      return ''
    }
  })

  const trackVote = (newVoteId: string) => {
    setVoteId(newVoteId)
    try {
      localStorage.setItem(storageKey, newVoteId)
    } catch (error) {
      console.error('Failed to persist vote ID:', error)
    }
  }

  const resetVote = () => {
    setVoteId('')
    try {
      localStorage.removeItem(storageKey)
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
