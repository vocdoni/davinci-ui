'use client'

import type { ElectionMetadata } from '@vocdoni/davinci-sdk'
import { Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { Input } from '~components/ui/input'
import { truncateText } from '~lib/utils'

interface ShareableLinkProps {
  voteId: string
  voteData: ElectionMetadata
}

export function ShareableLink({ voteId, voteData }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false)

  // Generate the shareable URL
  const shareUrl = `${window.location.origin}/vote/${voteId}`

  // Check if native sharing is actually available and functional
  // We check for the API existence rather than just mobile detection
  const isNativeShareAvailable = 'share' in navigator && typeof navigator.share === 'function'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'DAVINCI Vote',
        text: 'Check out this vote on DAVINCI',
        url: shareUrl,
      })
    } catch (error) {
      console.error('Native share failed:', error)
      // Fallback to Twitter share if native share fails
      handleTwitterShare()
    }
  }

  const handleTwitterShare = () => {
    const link = `https://x.com/intent/post?text=${encodeURIComponent(
      import.meta.env.SHARE_TEXT.replace('{link}', shareUrl)
        .replace('{app}', window.location.origin)
        .replace('{title}', truncateText(voteData.title.default, 60))
    )}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleFarcasterShare = () => {
    const text = import.meta.env.SHARE_TEXT.replace('{link}', shareUrl)
      .replace('{app}', window.location.origin)
      .replace('{title}', truncateText(voteData.title.default, 60))
    const link = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className='border-davinci-callout-border bg-davinci-paper-base/80'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-davinci-black-alt text-lg'>
          <Share2 className='w-5 h-5' />
          Share This Vote
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-davinci-black-alt/80'>
          Share this vote with others to increase participation and transparency.
        </p>

        <div className='space-y-3'>
          <div className='flex gap-2'>
            <Input value={shareUrl} readOnly className='border-davinci-callout-border text-xs font-mono' />
            <Button
              onClick={handleCopy}
              variant='outline'
              size='icon'
              className='border-davinci-callout-border hover:bg-davinci-soft-neutral/20 flex-shrink-0'
            >
              {copied ? <Check className='w-4 h-4 text-green-600' /> : <Copy className='w-4 h-4' />}
            </Button>
          </div>

          {/* Native share if available */}
          {isNativeShareAvailable && (
            <Button
              onClick={handleNativeShare}
              variant='outline'
              size='sm'
              className='w-full border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
            >
              <Share2 className='w-3 h-3 mr-1' />
              Share
            </Button>
          )}

          {/* Social platform buttons */}
          <div className='flex gap-2'>
            <Button
              onClick={handleTwitterShare}
              variant='outline'
              size='sm'
              className='flex-1 border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
            >
              <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
              Twitter
            </Button>
            <Button
              onClick={handleFarcasterShare}
              variant='outline'
              size='sm'
              className='flex-1 border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
            >
              <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M5.5 2h13A3.5 3.5 0 0122 5.5v13a3.5 3.5 0 01-3.5 3.5h-13A3.5 3.5 0 012 18.5v-13A3.5 3.5 0 015.5 2z' />
                <path d='M8 16h8v-1.5H8V16zM8 12h8v-1.5H8V12zM8 8h8V6.5H8V8z' fill='white' />
              </svg>
              Farcaster
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
