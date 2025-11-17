import { useQuery } from '@tanstack/react-query'
import { VoteStatus } from '@vocdoni/davinci-sdk'
import { useVocdoniApi } from '~contexts/vocdoni-api-context'

export function useVoteStatus(processId: string, voteId: string) {
  const { api } = useVocdoniApi()
  return useQuery({
    queryKey: ['voteStatus', processId, voteId],
    queryFn: async () => {
      const status = await api.sequencer.getVoteStatus(processId, voteId)
      return status
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Stop polling when vote is settled or has error
      if (status === VoteStatus.Settled || status === VoteStatus.Error) {
        return false
      }
      // Poll every 3 seconds
      return 3000
    },
    enabled: Boolean(processId && voteId), // Only run when we have both IDs
  })
}
