'use client'

import { Calendar, Clock, Settings, Shield, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

import type { ElectionMetadata } from '@vocdoni/davinci-sdk/core'
import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk/core'

interface ProcessData {
  voteCount: number
  endDate: number
  maxVoteCount: number
  isAcceptingVotes: boolean
  creator: string
}

interface VoteParametersProps {
  voteData: ElectionMetadata
  processData: ProcessData
}

export function VoteParameters({ voteData, processData }: VoteParametersProps) {
  const [currentTotalVotes, setCurrentTotalVotes] = useState(processData.voteCount)
  const [voteEnded, setVoteEnded] = useState(false)

  // Update vote count and status
  useEffect(() => {
    const checkVoteStatus = () => {
      const now = new Date()
      const hasEnded = now.getTime() >= processData.endDate * 1000
      setVoteEnded(hasEnded)
    }

    // Check immediately
    checkVoteStatus()

    // Check every second
    const interval = setInterval(checkVoteStatus, 1000)

    return () => clearInterval(interval)
  }, [processData.endDate])

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
            <p className='text-xs text-davinci-black-alt/80 font-mono break-all'>{processData.creator}</p>
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
            <p className='text-xs text-davinci-black-alt/80'>
              {Math.floor((processData.endDate - Math.floor(Date.now() / 1000)) / 60)} minutes
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className='flex items-start gap-3'>
          <Calendar className='w-4 h-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
          <div className='min-w-0 flex-1'>
            <h4 className='font-medium text-davinci-black-alt text-sm'>Timeline</h4>
            <div className='space-y-1'>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Started:</span>{' '}
                {formatDate(new Date((processData.endDate - 3600) * 1000))}
              </p>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Ends:</span> {formatDate(new Date(processData.endDate * 1000))}
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

interface TotalVotesCardProps {
  voteData: ElectionMetadata
  processData: ProcessData
  currentTotalVotes: number
  voteEnded: boolean
}

export function TotalVotesCard({ voteData, processData, currentTotalVotes, voteEnded }: TotalVotesCardProps) {
  return (
    <Card className='border-davinci-callout-border mb-6'>
      <CardContent className='p-6'>
        <div className='text-center'>
          <p className='text-3xl font-bold text-davinci-black-alt'>{currentTotalVotes.toLocaleString()}</p>
          <p className='text-sm text-davinci-black-alt/80'>{!voteEnded ? 'Votes Cast So Far' : 'Final Vote Count'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
