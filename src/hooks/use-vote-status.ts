import { useQuery } from '@tanstack/react-query'
import { VocdoniApiService, VoteStatus } from '@vocdoni/davinci-sdk/sequencer'

export function useVoteStatus(processId: string, voteId: string) {
  return useQuery({
    queryKey: ['voteStatus', processId, voteId],
    queryFn: async () => {
      const api = new VocdoniApiService(import.meta.env.SEQUENCER_URL)
      const status = await api.getVoteStatus(processId, voteId)
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
