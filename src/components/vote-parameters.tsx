'use client'

import { Calendar, Clock, Settings, Shield, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

interface VoteData {
  id: string
  question: string
  description: string
  choices: Array<{ id: string; text: string }>
  votingMethod: 'single-choice' | 'multiple-choice' | 'quadratic-voting'
  censusType: 'ethereum-wallets' | 'holonym-passport'
  duration: string
  durationUnit: 'minutes' | 'hours'
  creator: string
  startTime: Date
  endTime: Date
  totalVotes: number
  isActive: boolean
}

interface VoteParametersProps {
  voteData: VoteData
}

export function VoteParameters({ voteData }: VoteParametersProps) {
  const [currentTotalVotes, setCurrentTotalVotes] = useState(voteData.totalVotes)
  const [voteEnded, setVoteEnded] = useState(false)

  // Update vote count and status
  useEffect(() => {
    const checkVoteStatus = () => {
      const now = new Date()
      const hasEnded = now.getTime() >= voteData.endTime.getTime()
      setVoteEnded(hasEnded)
    }

    // Check immediately
    checkVoteStatus()

    // Check every second
    const interval = setInterval(checkVoteStatus, 1000)

    return () => clearInterval(interval)
  }, [voteData.endTime])

  // Simulate vote count increases while voting is active
  useEffect(() => {
    if (!voteEnded && voteData.isActive) {
      const interval = setInterval(() => {
        setCurrentTotalVotes((prev) => prev + Math.floor(Math.random() * 3))
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [voteEnded, voteData.isActive])

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
    switch (voteData.votingMethod) {
      case 'single-choice':
        return 'Single Choice'
      case 'multiple-choice':
        return 'Multiple Choice'
      case 'quadratic-voting':
        return 'Quadratic Voting'
      default:
        return 'Unknown'
    }
  }

  const getCensusTypeLabel = () => {
    switch (voteData.censusType) {
      case 'ethereum-wallets':
        return 'Ethereum Wallets'
      case 'holonym-passport':
        return 'Holonym Passport'
      default:
        return 'Unknown'
    }
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
            <p className='text-xs text-davinci-black-alt/80 font-mono break-all'>{voteData.creator}</p>
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
              {voteData.duration} {voteData.durationUnit}
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
                <span className='font-medium'>Started:</span> {formatDate(voteData.startTime)}
              </p>
              <p className='text-xs text-davinci-black-alt/80'>
                <span className='font-medium'>Ends:</span> {formatDate(voteData.endTime)}
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
  voteData: VoteData
  currentTotalVotes: number
  voteEnded: boolean
}

export function TotalVotesCard({ voteData, currentTotalVotes, voteEnded }: TotalVotesCardProps) {
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
