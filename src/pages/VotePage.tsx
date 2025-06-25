import { useCopyToClipboard } from '@uidotdev/usehooks'
import type { ElectionMetadata } from '@vocdoni/davinci-sdk/core'
import { VocdoniApiService, type GetProcessResponse } from '@vocdoni/davinci-sdk/sequencer'
import { LucideCheck, LucideCopy, LucideSearch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { NewsletterCard } from '~components/newsletter-card'
import { ShareableLink } from '~components/shareable-link'
import { VoteDisplay } from '~components/vote-display'
import { TotalVotesCard, VoteParameters } from '~components/vote-parameters'
import { truncateAddress } from '~lib/web3-utils'

export default function VotePage() {
  const params = useParams()
  const [voteData, setVoteData] = useState<ElectionMetadata | null>(null)
  const [processData, setProcessData] = useState<GetProcessResponse | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTotalVotes, setCurrentTotalVotes] = useState(0)
  const [voteEnded, setVoteEnded] = useState(false)
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  const hasCopiedText = Boolean(copiedText)

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
          <h1 className='text-3xl font-bold text-davinci-black-alt mb-2 font-averia'>
            {voteData.questions[0].title.default}
          </h1>
          <div className='flex items-center justify-center gap-2 text-davinci-black-alt/70'>
            <span className='text-sm font-medium'>Process ID:</span>
            <code className='text-sm font-mono bg-davinci-soft-neutral/30 px-2 py-1 rounded border border-davinci-callout-border'>
              {truncateAddress(params.id as string, 8)}
            </code>
            <button
              className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent h-6 w-6 hover:bg-davinci-soft-neutral/20 transition-colors'
              title='Copy full Process ID'
              onClick={() => copyToClipboard(params.id as string)}
            >
              {hasCopiedText ? (
                <LucideCheck className='w-3 h-3 text-davinci-black-alt/60 hover:text-davinci-black-alt' />
              ) : (
                <LucideCopy className='w-3 h-3 text-davinci-black-alt/60 hover:text-davinci-black-alt' />
              )}
            </button>
            <a
              className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent h-6 w-6 hover:bg-davinci-soft-neutral/20 transition-colors'
              title='Check Process Details'
              target='_blank'
              href={import.meta.env.SEQUENCER_URL + '/app?processId=' + params.id}
            >
              <LucideSearch className='w-3 h-3 text-davinci-black-alt/60 hover:text-davinci-black-alt' />
            </a>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column - Vote Display (wider) */}
          <div className='lg:col-span-8'>
            <VoteDisplay voteData={voteData} processData={processData as GetProcessResponse} id={params.id as string} />
          </div>

          {/* Right Column - Info Cards */}
          <div className='lg:col-span-4 space-y-6'>
            <TotalVotesCard
              voteData={voteData}
              processData={processData as GetProcessResponse}
              currentTotalVotes={currentTotalVotes}
              voteEnded={voteEnded}
            />
            <ShareableLink voteId={params.id as string} />
            <VoteParameters voteData={voteData} processData={processData as GetProcessResponse} />
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  )
}
