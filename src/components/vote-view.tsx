import { useCopyToClipboard } from '@uidotdev/usehooks'
import { type GetProcessResponse } from '@vocdoni/davinci-sdk/sequencer'
import { LucideCheck, LucideCopy, LucideSearch } from 'lucide-react'
import { NewsletterCard } from '~components/newsletter-card'
import { ShareableLink } from '~components/shareable-link'
import { VoteDisplay } from '~components/vote-display'
import { TotalVotesCard, VoteParameters } from '~components/vote-parameters'
import { truncateAddress } from '~lib/web3-utils'
import type { ProcessLoaderData } from '~src/types'

const VoteView = ({ id, meta, process }: ProcessLoaderData) => {
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  const hasCopiedText = Boolean(copiedText)

  return (
    <div className='px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-davinci-black-alt mb-2 font-averia'>
            {meta.questions[0].title.default}
          </h1>
          <div className='flex items-center justify-center gap-2 text-davinci-black-alt/70'>
            <span className='text-sm font-medium'>Process ID:</span>
            <code className='text-sm font-mono bg-davinci-soft-neutral/30 px-2 py-1 rounded border border-davinci-callout-border'>
              {truncateAddress(id, 8)}
            </code>
            <button
              className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent h-6 w-6 hover:bg-davinci-soft-neutral/20 transition-colors'
              title='Copy full Process ID'
              onClick={() => copyToClipboard(id)}
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
              href={import.meta.env.SEQUENCER_URL + '/app?processId=' + id}
            >
              <LucideSearch className='w-3 h-3 text-davinci-black-alt/60 hover:text-davinci-black-alt' />
            </a>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column - Vote Display (wider) */}
          <div className='lg:col-span-8'>
            <VoteDisplay />
          </div>

          {/* Right Column - Info Cards */}
          <div className='lg:col-span-4 space-y-6'>
            <TotalVotesCard voteData={meta} processData={process as GetProcessResponse} />
            <ShareableLink voteId={id} voteData={meta} />
            <VoteParameters voteData={meta} processData={process as GetProcessResponse} />
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoteView
