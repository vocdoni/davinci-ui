import { useAppKit, useAppKitAccount, useAppKitState, useDisconnect } from '@reown/appkit/react'
import { Loader2, Wallet } from 'lucide-react'
import { truncateAddress } from '~lib/web3-utils'
import { Button, type ButtonProps } from './button'

const ConnectWalletButton = (props: ButtonProps) => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { loading } = useAppKitState()
  const { disconnect } = useDisconnect()

  const handleConnectWallet = async () => {
    if (isConnected) {
      await disconnect()
    } else {
      open()
    }
  }

  return (
    <Button
      onClick={handleConnectWallet}
      {...props}
      className={`bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base whitespace-nowrap ${props.className}`}
    >
      {isConnected && address ? (
        <>
          <Wallet className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>{truncateAddress(address)}</span>
          <span className='sm:hidden'>{truncateAddress(address, 4, 4)}</span>
        </>
      ) : loading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          <span className='hidden sm:inline'>Connecting...</span>
          <span className='sm:hidden'>...</span>
        </>
      ) : (
        <>
          <Wallet className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>Connect Wallet</span>
          <span className='sm:hidden'>Connect</span>
        </>
      )}
    </Button>
  )
}

export default ConnectWalletButton
