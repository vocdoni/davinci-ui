import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { ProcessRegistryService, ProcessStatus } from '@vocdoni/davinci-sdk'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { Cog, StopCircle } from 'lucide-react'
import { useState } from 'react'
import { useElection } from '~contexts/election-context'
import { useVocdoniApi } from '~contexts/vocdoni-api-context'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const VoteActions = () => {
  const { api } = useVocdoniApi()
  const { isCreator, election, isPaused, isAcceptingVotes } = useElection()
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [isLoading, setIsLoading] = useState(false)

  if (!isConnected || !isCreator || (!isPaused && !isAcceptingVotes)) return null

  const handleEndProcess = async () => {
    if (!walletProvider) return

    setIsLoading(true)
    try {
      // Get contract address from sequencer info
      const info = await api.sequencer.getInfo()
      const processRegistryAddress = info.contracts.process

      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      const signer = await provider.getSigner()
      const registry = new ProcessRegistryService(processRegistryAddress, signer)
      // Use setProcessStatus to end the process
      const txStream = registry.setProcessStatus(election!.process.id, ProcessStatus.ENDED)
      // Execute the transaction and wait for it to complete
      for await (const event of txStream) {
        if (event.status === 'completed') {
          console.log('Process ended successfully')
        } else if (event.status === 'failed' || event.status === 'reverted') {
          throw new Error('Transaction failed')
        }
      }
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
