import { useLoaderData } from 'react-router-dom'
import { ProcessProvider } from '~components/process-context'
import VoteView from '~components/vote-view'
import type { ProcessLoaderData } from '~src/types'

const VotePage = () => {
  const { meta, process, id } = useLoaderData() as ProcessLoaderData
  return (
    <ProcessProvider process={{ process, meta }}>
      <VoteView meta={meta} process={process} id={id} />
    </ProcessProvider>
  )
}
export default VotePage
