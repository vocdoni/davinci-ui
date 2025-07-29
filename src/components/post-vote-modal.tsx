'use client'

import { X } from 'lucide-react'
import { Button } from '~components/ui/button'
import {
  Dialog,
  DialogContent,
} from '~components/ui/dialog'
import { ErrorBoundaryWrapper } from '~components/ui/error-boundary'
import { Spinner } from '~components/ui/spinner'

interface PostVoteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PostVoteModal({ isOpen, onClose }: PostVoteModalProps) {
  return (
    <ErrorBoundaryWrapper>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='bg-davinci-paper-base border-davinci-callout-border max-w-md p-0'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>

          <div className='p-6 space-y-4'>
            {/* Title with spinner */}
            <div className='flex items-center gap-3'>
              <Spinner className='w-4 h-4' />
              <h2 className='text-lg font-semibold text-davinci-black-alt'>Vote Being Processed</h2>
            </div>

            {/* Description text */}
            <p className='text-sm text-davinci-black-alt/80 leading-relaxed'>
              Your vote is being processed through the DAVINCI network. You can safely close this app and return later to check the progress.
            </p>

            {/* View Progress button */}
            <div className='pt-2'>
              <Button
                onClick={onClose}
                className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base px-6'
              >
                View Progress
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundaryWrapper>
  )
}