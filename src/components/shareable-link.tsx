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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'DAVINCI Vote',
        text: 'Check out this vote on DAVINCI',
        url: shareUrl,
      })
    } else {
      const link = `https://x.com/intent/post?text=${encodeURIComponent(
        import.meta.env.SHARE_TEXT.replace('{link}', shareUrl)
          .replace('{app}', window.location.origin)
          .replace('{title}', truncateText(voteData.title.default, 60))
      )}`
      window.open(link, '_blank', 'noopener,noreferrer')
    }
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

          <Button
            onClick={handleShare}
            variant='outline'
            size='sm'
            className='w-full border-davinci-callout-border text-davinci-black-alt hover:bg-davinci-soft-neutral/20'
          >
            <Share2 className='w-3 h-3 mr-1' />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
