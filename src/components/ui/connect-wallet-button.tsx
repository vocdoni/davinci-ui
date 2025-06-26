import { useConnectWallet } from '@web3-onboard/react'
import { Loader2, Wallet } from 'lucide-react'
import { truncateAddress } from '~lib/web3-utils'
import { Button, type ButtonProps } from './button'

const ConnectWalletButton = (props: ButtonProps) => {
  const [{ connecting, wallet }, connect, disconnect] = useConnectWallet()

  const handleConnectWallet = async () => {
    if (wallet) {
      await disconnect(wallet)
    } else {
      await connect()
    }
  }

  return (
    <Button
      onClick={handleConnectWallet}
      {...props}
      className={`bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base whitespace-nowrap ${props.className}`}
    >
      {connecting ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          <span className='hidden sm:inline'>Connecting...</span>
          <span className='sm:hidden'>...</span>
        </>
      ) : !!wallet ? (
        <>
          <Wallet className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>{truncateAddress(wallet.accounts[0].address)}</span>
          <span className='sm:hidden'>{truncateAddress(wallet.accounts[0].address, 4, 4)}</span>
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
