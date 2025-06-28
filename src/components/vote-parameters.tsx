'use client'

import { Calendar, Clock, Settings, Shield, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

import { ProcessStatus } from '@vocdoni/davinci-sdk/contracts'
import type { ElectionMetadata } from '@vocdoni/davinci-sdk/core'
import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk/core'
import type { GetProcessResponse } from '@vocdoni/davinci-sdk/sequencer'
import { formatNanosecondsInterval } from '~lib/utils'
import { useProcess } from './process-context'

interface ProcessData {
  voteCount: number
  endDate: number
  maxVoteCount: number
  isAcceptingVotes: boolean
  creator: string
}

interface VoteParametersProps {
  voteData: ElectionMetadata
  processData: GetProcessResponse
}

export function VoteParameters({ voteData, processData }: VoteParametersProps) {
  const [currentTotalVotes, setCurrentTotalVotes] = useState(processData.voteCount)
  const [voteEnded, setVoteEnded] = useState(false)

  // Update vote count and status
  useEffect(() => {
    const checkVoteStatus = () => {
      const hasEnded = processData.status === ProcessStatus.ENDED
      setVoteEnded(hasEnded)
    }

    // Check immediately
    checkVoteStatus()

    // Check every second
    const interval = setInterval(checkVoteStatus, 1000)

    return () => clearInterval(interval)
  }, [processData.status])

  // Simulate vote count increases while voting is active
  useEffect(() => {
    if (!voteEnded && processData.isAcceptingVotes) {
      const interval = setInterval(() => {
        setCurrentTotalVotes((prev) => prev + Math.floor(Math.random() * 3))
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [voteEnded, processData.isAcceptingVotes])

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
      default:
        return 'Unknown'
    }
  }

  const getCensusTypeLabel = () => {
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
                <span className='font-medium'>Started:</span> {formatDate(new Date(processData.startTime))}
              </p>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Ends:</span>{' '}
                {formatDate(new Date(new Date(processData.startTime).getTime() + processData.duration / 1_000_000))}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className='text-center'>
          <Badge className={`${voteEnded ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
            {voteEnded ? 'Vote Ended' : 'Vote Active'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export const TotalVotesCard = () => {
  const {
    process: { process },
  } = useProcess()
  const voteEnded = [ProcessStatus.ENDED, ProcessStatus.CANCELED, ProcessStatus.RESULTS].includes(process.status)

  return (
    <Card className='border-davinci-callout-border mb-6'>
      <CardContent className='p-6'>
        <div className='text-center'>
          <p className='text-3xl font-bold text-davinci-black-alt'>{process.voteCount.toLocaleString()}</p>
          <p className='text-sm text-davinci-black-alt/80 capitalize'>
            {!voteEnded ? 'Votes cast so far' : 'Final vote count'}
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
