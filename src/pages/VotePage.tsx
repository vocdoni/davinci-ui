import type { ElectionMetadata } from '@vocdoni/davinci-sdk/core'
import { VocdoniApiService } from '@vocdoni/davinci-sdk/sequencer'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { NewsletterCard } from '~components/newsletter-card'
import { ShareableLink } from '~components/shareable-link'
import { VoteDisplay } from '~components/vote-display'
import { TotalVotesCard, VoteParameters } from '~components/vote-parameters'

export default function VotePage() {
  const params = useParams()
  const [voteData, setVoteData] = useState<ElectionMetadata | null>(null)
  const [processData, setProcessData] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTotalVotes, setCurrentTotalVotes] = useState(0)
  const [voteEnded, setVoteEnded] = useState(false)

  useEffect(() => {
    setIsClient(true)
    ;(async () => {
      const api = new VocdoniApiService(import.meta.env.SEQUENCER_URL)

      const process = await api.getProcess(params.id as string)
      const meta = await api.getMetadata(process.metadataURI.substring(process.metadataURI.lastIndexOf('/') + 1))

      setVoteData(meta)
      setProcessData(process)
      setIsLoading(false)
    })()
  }, [params.id])

  if (!isClient || isLoading) {
    return (
      <div className='px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-16'>
            <div className='w-8 h-8 border-2 border-davinci-black-alt/30 border-t-davinci-black-alt rounded-full animate-spin mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-davinci-black-alt'>Loading vote...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!voteData) {
    return (
      <div className='px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-16'>
            <h1 className='text-2xl font-bold text-davinci-black-alt mb-4'>Vote Not Found</h1>
            <p className='text-davinci-black-alt/80'>The vote you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-davinci-black-alt mb-2 font-averia'>Vote #{params.id}</h1>
          <p className='text-davinci-black-alt/80'>Cast your vote on this important community decision</p>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column - Vote Display (wider) */}
          <div className='lg:col-span-8'>
            <VoteDisplay voteData={voteData} processData={processData} />
          </div>

          {/* Right Column - Info Cards */}
          <div className='lg:col-span-4 space-y-6'>
            <TotalVotesCard
              voteData={voteData}
              processData={processData}
              currentTotalVotes={currentTotalVotes}
              voteEnded={voteEnded}
            />
            <ShareableLink voteId={params.id as string} />
            <VoteParameters voteData={voteData} processData={processData} />
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  )
}
