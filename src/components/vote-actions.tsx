import { TxStatus } from '@vocdoni/davinci-sdk'
import { Cog, StopCircle } from 'lucide-react'
import { useState } from 'react'
import { useElection } from '~contexts/election-context'
import { useVocdoniApi } from '~contexts/vocdoni-api-context'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const VoteActions = () => {
  const { sdk } = useVocdoniApi()
  const { isCreator, election, isPaused, isAcceptingVotes, refetch } = useElection()
  const { isConnected } = useUnifiedWallet()
  const [isLoading, setIsLoading] = useState(false)

  if (!isConnected || !isCreator || (!isPaused && !isAcceptingVotes)) return null

  const handleEndProcess = async () => {
    if (!sdk || !election) return

    setIsLoading(true)
    try {
      const stream = sdk.endProcessStream(election.process.id)

      for await (const event of stream) {
        switch (event.status) {
          case TxStatus.Pending:
            console.log('End process tx pending:', event.hash)
            break
          case TxStatus.Completed:
            console.log('Process ended successfully')
            break
          case TxStatus.Failed:
            throw event.error
          case TxStatus.Reverted:
            throw new Error(event.reason || 'Transaction reverted')
        }
      }

      await refetch()
    } catch (error) {
      console.error('Error ending process:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='border-davinci-callout-border bg-davinci-paper-base/80'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-davinci-black-alt text-lg'>
          <Cog className='w-5 h-5' />
          Vote actions
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-davinci-black-alt/80'>As the creator of this vote, you can manage it from here.</p>
        <div>
          <Button onClick={handleEndProcess} loading={isLoading} variant='secondary' className='w-full'>
            {!isLoading && <StopCircle className='w-4 h-4 mr-2' />}
            End process
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default VoteActions
