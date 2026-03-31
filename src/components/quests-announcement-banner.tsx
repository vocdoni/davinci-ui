import { ExternalLink } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardTitle } from '~components/ui/card'
import { cn } from '~lib/utils'

interface QuestsAnnouncementBannerProps {
  className?: string
}

export function QuestsAnnouncementBanner({ className }: QuestsAnnouncementBannerProps) {
  return (
    <Card className={cn('border-davinci-callout-border', className)}>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <CardTitle className='py-2 text-davinci-black-alt'>Complete quests. Support the protocol.</CardTitle>

          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <p className='text-davinci-black-alt/80'>
              Join the community, complete tasks, and earn points while helping Vocdoni grow.
            </p>

            <Button asChild className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'>
              <a href='https://quests.davinci.ninja/' target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='w-4 h-4 mr-2' />
                Visit Quests App to participate
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
