import { useAppKit, useAppKitAccount, useAppKitState, useDisconnect } from '@reown/appkit/react'
import { Loader2, User, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMiniApp } from '~contexts/MiniAppContext'
import { truncateAddress } from '~lib/web3-utils'
import { Button, type ButtonProps } from './button'

const ConnectWalletButtonMiniApp = (props: ButtonProps) => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { open: isModalOpen } = useAppKitState()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const [farcasterConnected, setFarcasterConnected] = useState(false)
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null)

  // Use the MiniApp context
  const { isMiniApp, user: farcasterUser, connectFarcasterWallet, isFarcasterWalletConnected } = useMiniApp()

  // Check Farcaster wallet connection status
  useEffect(() => {
    const checkFarcasterConnection = async () => {
      if (isMiniApp) {
        try {
          const connected = await isFarcasterWalletConnected()
          setFarcasterConnected(connected)

          if (connected) {
            // Get the address from Farcaster wallet
            const result = await connectFarcasterWallet()
            if (result) {
              setFarcasterAddress(result.address)
            }
          }
        } catch (error) {
          console.error('Error checking Farcaster wallet:', error)
        }
      }
    }

    checkFarcasterConnection()
  }, [isMiniApp, isFarcasterWalletConnected, connectFarcasterWallet])

  // Reset connecting state when modal closes without connection
  useEffect(() => {
    if (!isModalOpen && !isConnected && !farcasterConnected) {
      setIsConnecting(false)
    }
  }, [isModalOpen, isConnected, farcasterConnected])

  const handleConnectWallet = async () => {
    // If already connected to either wallet, disconnect
    if (isConnected || farcasterConnected) {
      if (farcasterConnected) {
        // For Farcaster wallet, we just reset the state
        setFarcasterConnected(false)
        setFarcasterAddress(null)
      }
      if (isConnected) {
        await disconnect()
      }
      return
    }

    setIsConnecting(true)

    // If in mini app, try Farcaster wallet first
    if (isMiniApp) {
      try {
        const result = await connectFarcasterWallet()
        if (result) {
          setFarcasterConnected(true)
          setFarcasterAddress(result.address)
          setIsConnecting(false)
          return
        }
      } catch (error) {
        console.warn('Farcaster wallet connection failed, falling back to regular wallet:', error)
      }
    }

    // Fall back to regular wallet connection
    open()
  }

  const loading = isConnecting && !isConnected && !farcasterConnected
  const connected = isConnected || farcasterConnected
  const displayAddress = farcasterAddress || address

  // Show Farcaster user info if available and connected via Farcaster
  const showFarcasterInfo = farcasterConnected && farcasterUser

  return (
    <Button
      onClick={handleConnectWallet}
      {...props}
      className={`bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base whitespace-nowrap ${props.className}`}
    >
      {connected && displayAddress ? (
        <>
          {showFarcasterInfo ? (
            <>
              <User className='w-4 h-4 mr-2' />
              <span className='hidden sm:inline'>
                {farcasterUser.displayName || `@${farcasterUser.username}` || truncateAddress(displayAddress)}
              </span>
              <span className='sm:hidden'>
                {farcasterUser.username ? `@${farcasterUser.username}` : truncateAddress(displayAddress, 4, 4)}
              </span>
            </>
          ) : (
            <>
              <Wallet className='w-4 h-4 mr-2' />
              <span className='hidden sm:inline'>{truncateAddress(displayAddress)}</span>
              <span className='sm:hidden'>{truncateAddress(displayAddress, 4, 4)}</span>
            </>
          )}
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
          <span className='hidden sm:inline'>{isMiniApp ? 'Connect' : 'Connect Wallet'}</span>
          <span className='sm:hidden'>Connect</span>
        </>
      )}
    </Button>
  )
}

export default ConnectWalletButtonMiniApp
