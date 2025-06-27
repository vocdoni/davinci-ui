import { useLoaderData } from 'react-router-dom'
import { ProcessProvider } from '~components/process-context'
import VoteView from '~components/vote-view'
import useLoaderAutoRefresh from '~hooks/use-loader-autorefresh'
import type { ProcessLoaderData } from '~src/types'

const VotePage = () => {
  const { meta, process, id } = useLoaderData() as ProcessLoaderData

  useLoaderAutoRefresh(10_000)

  return (
    <ProcessProvider process={{ process, meta }}>
      <VoteView meta={meta} process={process} id={id} />
    </ProcessProvider>
  )
}
export default VotePage
