import { Calendar, Clock, Settings, Shield, User, Users } from 'lucide-react'
import { Badge } from '~components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk'
import { useElection } from '~contexts/election-context'
import { formatNanosecondsInterval } from '~lib/utils'

export function VoteParameters() {
  const { election, voteHasEnded, voteStartTime, voteEndTime } = useElection()

  if (!election) return null

  const voteData = election.meta
  const processData = election.process

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  const getVotingMethodLabel = () => {
    switch (voteData.type.name) {
      case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
        return 'Single Choice'
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return 'Multiple Choice'
      case ElectionResultsTypeNames.QUADRATIC:
        return 'Quadratic Voting'
      case ElectionResultsTypeNames.BUDGET:
        return 'Budget Voting'
      default:
        return 'Unknown'
    }
  }

  const getCensusTypeLabel = () => {
    const isRemote = processData.census.censusURI.startsWith('http')
    if (isRemote) {
      if (voteData?.meta?.census) {
        return voteData.meta.census.name
      }
      return 'Prebuilt census'
    }
    return 'Ethereum Wallets'
  }

  return (
    <Card className='border-davinci-callout-border bg-davinci-paper-base/80'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-davinci-black-alt text-lg'>
          <Settings className='w-5 h-5' />
          Vote Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Creator */}
        <div className='flex items-start gap-3'>
          <User className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Creator</h4>
            <p className='text-xs text-davinci-black-alt/80 font-mono break-all'>{processData.organizationId}</p>
          </div>
        </div>

        {/* Privacy */}
        <div className='flex items-start gap-3'>
          <Shield className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Privacy</h4>
            <p className='text-xs text-davinci-black-alt/80'>Anonymous voting</p>
          </div>
        </div>

        {/* Voting Method */}
        <div className='flex items-start gap-3'>
          <div className='w-4 h-4 mt-0.5 flex-shrink-0'>
            <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-1' />
          </div>
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Voting Method</h4>
            <Badge className='bg-davinci-soft-neutral text-davinci-black-alt text-xs mt-1'>
              {getVotingMethodLabel()}
            </Badge>
          </div>
        </div>

        {/* Census Type */}
        <div className='flex items-start gap-3'>
          <Users className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Eligible Voters</h4>
            <p className='text-xs text-davinci-black-alt/80'>{getCensusTypeLabel()}</p>
          </div>
        </div>

        {/* Duration */}
        <div className='flex items-start gap-3'>
          <Clock className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Duration</h4>
            <p className='text-xs text-davinci-black-alt/80'>{formatNanosecondsInterval(processData.duration)}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className='flex items-start gap-3'>
          <Calendar className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Timeline</h4>
            <div className='space-y-1'>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Started:</span> {voteStartTime ? formatDate(voteStartTime) : 'N/A'}
              </p>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Ends:</span> {voteEndTime ? formatDate(voteEndTime) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className='text-center'>
          <Badge className={`${voteHasEnded ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
            {voteHasEnded ? 'Vote Ended' : 'Vote Active'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export const TotalVotesCard = () => {
  const { election, voteHasEnded, uniqueVoters } = useElection()

  if (!election) return null

  const process = election.process

  return (
    <Card className='border-davinci-callout-border mb-6'>
      <CardContent className='p-6'>
        <div className='text-center'>
          <p className='text-3xl font-bold text-davinci-black-alt'>{uniqueVoters.toLocaleString()}</p>
          <p className='text-sm text-davinci-black-alt/80'>
            {!voteHasEnded ? 'Votes settled so far' : 'Final vote count'}
          </p>
          <div className='border mt-4 p-2'>
            <p className='text-xs uppercase tracking-wide text-davinci-black-alt/60'>Sequencer stats</p>
            <div className='mt-1 flex justify-center gap-2 text-sm text-davinci-black-alt/80'>
              <p>{process.sequencerStats.verifiedVotesCount.toString()} verified</p>
              <span>•</span>
              <p>{process.sequencerStats.pendingVotesCount.toString()} pending</p>
              <span>•</span>
              <p>{process.sequencerStats.settledStateTransitionCount.toString()} transitions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
