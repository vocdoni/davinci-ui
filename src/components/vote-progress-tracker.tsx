'use client'

import type React from 'react'

import { VoteStatus } from '@vocdoni/davinci-sdk/sequencer'
import { AlertTriangle, CheckCircle, Clock, Cpu, Info, Package, RefreshCw, Shield } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '~components/ui/badge'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { Progress } from '~components/ui/progress'
import { useVoteStatus } from '~hooks/use-vote-status'

export { VoteStatus }

interface VoteProgressTrackerProps {
  isVisible: boolean
  onResetProgress: () => void
  onVoteAgain: () => void
  processId: string
  voteId: string
}

interface ProgressStep {
  id: VoteStatus
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const progressSteps: ProgressStep[] = [
  {
    id: VoteStatus.Pending,
    label: 'Pending',
    description: 'Vote submitted, awaiting verification',
    icon: <Clock className='w-4 h-4' />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: VoteStatus.Verified,
    label: 'Verified',
    description: 'Vote successfully verified',
    icon: <CheckCircle className='w-4 h-4' />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: VoteStatus.Aggregated,
    label: 'Aggregated',
    description: 'Vote included in aggregated batch',
    icon: <Package className='w-4 h-4' />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: VoteStatus.Processed,
    label: 'Processed',
    description: 'Vote incorporated into state transition batch',
    icon: <Cpu className='w-4 h-4' />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    id: VoteStatus.Settled,
    label: 'Settled',
    description: 'Vote finalized on Ethereum blockchain',
    icon: <Shield className='w-4 h-4' />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
]

const statusToProgress: Record<VoteStatus, number> = {
  [VoteStatus.Pending]: 10,
  [VoteStatus.Verified]: 25,
  [VoteStatus.Aggregated]: 50,
  [VoteStatus.Processed]: 75,
  [VoteStatus.Settled]: 100,
  [VoteStatus.Error]: 0,
}

export function VoteProgressTracker({
  isVisible,
  onResetProgress,
  onVoteAgain,
  processId,
  voteId,
}: VoteProgressTrackerProps) {
  const { data: voteStatusData, isLoading, error } = useVoteStatus(processId, voteId)

  const currentStatus = voteStatusData?.status || VoteStatus.Pending
  const progress = statusToProgress[currentStatus]
  const isProcessing = currentStatus !== VoteStatus.Settled && currentStatus !== VoteStatus.Error && !error
  const showRecastNotification = currentStatus === VoteStatus.Settled

  useEffect(() => {
    if (error) {
      console.error('Error fetching vote status:', error)
    }
  }, [error])

  if (!isVisible) return null

  const getCurrentStep = () => progressSteps.find((step) => step.id === currentStatus)
  const currentStepIndex = progressSteps.findIndex((step) => step.id === currentStatus)

  return (
    <Card className='border-davinci-callout-border bg-davinci-digital-highlight/30'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2 text-davinci-black-alt text-lg'>
          <div
            className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : currentStatus === VoteStatus.Settled ? 'bg-green-500' : 'bg-red-500'}`}
          />
          Vote Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Current Status Display */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-full ${getCurrentStep()?.bgColor || 'bg-gray-100'}`}>
              <div className={getCurrentStep()?.color || 'text-gray-600'}>
                {currentStatus === VoteStatus.Error || error ? (
                  <AlertTriangle className='w-4 h-4' />
                ) : (
                  getCurrentStep()?.icon
                )}
              </div>
            </div>
            <div>
              <p className='font-semibold text-davinci-black-alt'>
                {isLoading
                  ? 'Loading...'
                  : currentStatus === VoteStatus.Error || error
                    ? 'Processing Error'
                    : getCurrentStep()?.label}
              </p>
              <p className='text-sm text-davinci-black-alt/70'>
                {isLoading
                  ? 'Fetching vote status...'
                  : currentStatus === VoteStatus.Error || error
                    ? 'An error occurred while processing your vote'
                    : getCurrentStep()?.description}
              </p>
            </div>
          </div>
          <div className='text-right'>
            <Badge
              className={`${
                currentStatus === VoteStatus.Settled
                  ? 'bg-green-100 text-green-800'
                  : currentStatus === VoteStatus.Error || error
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {currentStatus === VoteStatus.Settled ? 'Complete' : isProcessing ? 'Processing' : 'Failed'}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {currentStatus !== VoteStatus.Error && !error && (
          <div className='space-y-2'>
            <div className='flex justify-between text-sm text-davinci-black-alt/70'>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2 bg-davinci-soft-neutral' />
          </div>
        )}

        {/* Step Timeline */}
        <div className='space-y-3'>
          <h4 className='font-medium text-davinci-black-alt text-sm'>Processing Steps</h4>
          <div className='space-y-2'>
            {progressSteps.map((step, index) => {
              const isCompleted = currentStatus !== VoteStatus.Error && !error && index <= currentStepIndex
              const isCurrent = currentStatus === step.id
              const isPending = currentStatus !== VoteStatus.Error && !error && index > currentStepIndex

              return (
                <div key={step.id} className='flex items-center gap-3'>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isCurrent
                          ? `${step.bgColor} ${step.color}`
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle className='w-3 h-3' />
                    ) : isCurrent ? (
                      <div className='w-2 h-2 bg-current rounded-full animate-pulse' />
                    ) : (
                      <div className='w-2 h-2 bg-current rounded-full' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-davinci-black-alt' : 'text-davinci-black-alt/50'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs ${
                        isCompleted || isCurrent ? 'text-davinci-black-alt/70' : 'text-davinci-black-alt/40'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  {isCurrent && isProcessing && (
                    <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error State Actions */}
        {(currentStatus === VoteStatus.Error || error) && (
          <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <h4 className='font-medium text-red-800 mb-1'>Vote Processing Failed</h4>
                <p className='text-sm text-red-700 mb-3'>
                  Your vote could not be processed due to a network error. Please try voting again.
                </p>
                <div className='flex gap-2'>
                  <Button onClick={onVoteAgain} size='sm' className='bg-red-600 hover:bg-red-700 text-white'>
                    <RefreshCw className='w-3 h-3 mr-1' />
                    Try Again
                  </Button>
                  <Button
                    onClick={onResetProgress}
                    variant='outline'
                    size='sm'
                    className='border-red-300 text-red-700 hover:bg-red-50'
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settlement Success & Recast Notification */}
        {showRecastNotification && currentStatus === VoteStatus.Settled && (
          <div className='bg-emerald-50 p-4 rounded-lg border border-emerald-200'>
            <div className='flex items-start gap-3'>
              <Shield className='w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <h4 className='font-medium text-emerald-800 mb-1'>Vote Successfully Settled</h4>
                <p className='text-sm text-emerald-700 mb-3'>
                  Your vote has been finalized on the Ethereum blockchain. You can now cast a new vote if you wish to
                  change your choice. Only your most recent vote will be counted.
                </p>
                <div className='flex gap-2'>
                  <Button onClick={onVoteAgain} size='sm' className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                    <RefreshCw className='w-3 h-3 mr-1' />
                    Vote Again
                  </Button>
                  <Button
                    onClick={onResetProgress}
                    variant='outline'
                    size='sm'
                    className='border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Info */}
        {isProcessing && !error && (
          <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
            <div className='flex items-start gap-2'>
              <Info className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm text-blue-800'>
                  <strong>Processing your vote:</strong> Your vote is being securely processed through the DAVINCI
                  network. This ensures maximum security and prevents any tampering.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
