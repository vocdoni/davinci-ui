'use client'

import { ElectionResultsTypeNames } from '@vocdoni/davinci-sdk/core'
import { AlertTriangle, BarChart3, CheckSquare, Shield } from 'lucide-react'
import { Button } from '~components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~components/ui/dialog'
import { ErrorBoundaryWrapper } from '~components/ui/error-boundary'

interface VotingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedChoice: string
  voteQuestion: string
  isRevote: boolean
  votingMethod: ElectionResultsTypeNames
}

export function VotingModal({
  isOpen,
  onClose,
  onConfirm,
  selectedChoice,
  voteQuestion,
  isRevote = false,
  votingMethod,
}: VotingModalProps) {
  const getIcon = () => {
    if (isRevote) return <Shield className='w-5 h-5 text-blue-500' />

    switch (votingMethod) {
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return <CheckSquare className='w-5 h-5 text-green-500' />
      case ElectionResultsTypeNames.QUADRATIC:
        return <BarChart3 className='w-5 h-5 text-purple-500' />
      case ElectionResultsTypeNames.BUDGET:
        return <BarChart3 className='w-5 h-5 text-blue-500' />
      default:
        return <AlertTriangle className='w-5 h-5 text-orange-500' />
    }
  }

  const getTitle = () => {
    if (isRevote) return 'Update Your Vote'

    switch (votingMethod) {
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return 'Confirm Multiple Choice Vote'
      case ElectionResultsTypeNames.QUADRATIC:
        return 'Confirm Quadratic Vote'
      case ElectionResultsTypeNames.BUDGET:
        return 'Confirm Budget Vote'
      default:
        return 'Confirm Your Vote'
    }
  }

  const getDescription = () => {
    if (isRevote) {
      return "You're updating your previous vote. This will replace your current choice."
    }

    switch (votingMethod) {
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return 'Please review your multiple selections before submitting. You can change your vote later if needed.'
      case ElectionResultsTypeNames.QUADRATIC:
        return 'Please review your credit allocation before submitting. You can change your vote later if needed.'
      case ElectionResultsTypeNames.BUDGET:
        return 'Please review your credit allocation before submitting. You can change your vote later if needed.'
      default:
        return 'Please review your selection before submitting. You can change your vote later if needed.'
    }
  }

  return (
    <ErrorBoundaryWrapper>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='bg-davinci-paper-base border-davinci-callout-border max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-davinci-black-alt'>
              {getIcon()}
              {getTitle()}
            </DialogTitle>
            <DialogDescription className='text-davinci-black-alt/80'>{getDescription()}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
              <h4 className='font-medium text-davinci-black-alt mb-2'>Vote Question:</h4>
              <p className='text-sm text-davinci-black-alt/80 mb-3'>{voteQuestion}</p>

              <h4 className='font-medium text-davinci-black-alt mb-2'>Your Choice:</h4>
              <div className='text-sm font-medium text-davinci-black-alt bg-davinci-text-base p-3 rounded border border-davinci-callout-border'>
                {selectedChoice || 'No selection'}
              </div>
            </div>

            <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
              <p className='text-xs text-blue-800'>
                <strong>Anti-Coercion Protection:</strong> You can change your vote as many times as you want until the
                voting period ends. Only your final vote will count.
              </p>
            </div>
            <p className='text-xs text-davinci-black-alt/70'>
              <strong>Heads up:</strong> To complete your vote, you will need to sign a gasless (free) transaction. No
              crypto or fees are required.
            </p>
          </div>

          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={onClose}
              className='border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
            >
              <img src='/images/davinci-icon.png' alt='' className='w-4 h-4 mr-2' />
              {isRevote ? 'Update Vote' : 'Confirm Vote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundaryWrapper>
  )
}
