import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { deployedAddresses, ProcessRegistryService, ProcessStatus } from '@vocdoni/davinci-sdk'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { Cog, StopCircle } from 'lucide-react'
import { useState } from 'react'
import { useProcess } from './process-context'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const VoteActions = () => {
  const {
    isCreator,
    process: { process },
  } = useProcess()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [isLoading, setIsLoading] = useState(false)

  if (!isConnected || !isCreator || ![ProcessStatus.PAUSED, ProcessStatus.READY].includes(process.status)) return null

  const handleEndProcess = async () => {
    if (!walletProvider) return

    setIsLoading(true)
    try {
      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      const signer = await provider.getSigner()
      const registry = new ProcessRegistryService(deployedAddresses.processRegistry.sepolia, signer)
      await registry.endProcess(process.id)
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
