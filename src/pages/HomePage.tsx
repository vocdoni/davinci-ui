import { CreateVoteForm } from '~components/create-vote-form'
import { DavinciInfoCard } from '~components/davinci-info-card'
import { NewsletterCard } from '~components/newsletter-card'
import { Link } from '~components/ui/link'

export default function HomePage() {
  return (
    <div className='px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Create a Vote</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            Run a voting process powered by the DAVINCI protocol, offering the same verifiability and integrity as
            onchain voting, along with anonymity, anti-coercion, and all the guarantees required for a fair and secure
            election.{' '}
            <Link href='https://davinci.vote/#comparison' target='_blank'>
              Learn how DAVINCI compares to other voting systems
            </Link>
          </p>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Left Column - Voting Form (wider) */}
          <div className='lg:col-span-8'>
            <CreateVoteForm />
          </div>

          {/* Right Column - Info Cards */}
          <div className='lg:col-span-4 space-y-6'>
            <DavinciInfoCard />
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  )
}
