import { useLoaderData } from 'react-router-dom'
import { VoteErrorBoundary } from '~components/vote-error-boundary'
import VoteView from '~components/vote-view'
import { ElectionProvider } from '~contexts/election-context'
import useLoaderAutoRefresh from '~hooks/use-loader-autorefresh'

const VotePage = () => {
  const { election, id } = useLoaderData() as ProcessLoaderData

  useLoaderAutoRefresh(10_000)

  return (
    <VoteErrorBoundary>
      <ElectionProvider electionId={id} election={election} fetchCensus>
        <VoteView />
      </ElectionProvider>
    </VoteErrorBoundary>
  )
}
export default VotePage
