import { useAppKit, useAppKitAccount, useAppKitState, useDisconnect } from '@reown/appkit/react'
import { Loader2, Shield, User, Wallet } from 'lucide-react'
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
  const {
    isMiniApp,
    user: farcasterUser,
    connectFarcasterWallet,
    isFarcasterWalletConnected,
    isExternalWallet,
  } = useMiniApp()

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
    // If already connected, disconnect
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

    // If in mini app, use Farcaster wallet (handles both embedded and external)
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
        console.error('Farcaster wallet connection failed:', error)
        setIsConnecting(false)
        return
      }
    }

    // Use AppKit when not in miniapp
    if (!isMiniApp) {
      open()
    } else {
      setIsConnecting(false)
    }
  }

  const loading = isConnecting && !isConnected && !farcasterConnected
  const connected = isConnected || farcasterConnected
  const displayAddress = farcasterAddress || address

  // Show Farcaster user info if available and connected via Farcaster
  const showFarcasterInfo = farcasterConnected && farcasterUser

  // Determine button text based on connection state
  const getButtonText = () => {
    if (connected && displayAddress) {
      if (farcasterConnected) {
        // In miniapp, all providers are limited proxies, but we can still show the wallet type
        const icon =
          isMiniApp && isExternalWallet ? <Shield className='w-4 h-4 mr-2' /> : <User className='w-4 h-4 mr-2' />
        const walletType = isMiniApp && isExternalWallet ? 'External wallet (limited proxy)' : 'Embedded wallet'

        return {
          icon,
          text: showFarcasterInfo
            ? farcasterUser.displayName || `@${farcasterUser.username}` || truncateAddress(displayAddress)
            : truncateAddress(displayAddress),
          shortText: farcasterUser.username ? `@${farcasterUser.username}` : truncateAddress(displayAddress, 4, 4),
          tooltip: `Connected with ${walletType} via Farcaster. Limited to signing operations only.`,
        }
      } else if (isConnected) {
        return {
          icon: <Wallet className='w-4 h-4 mr-2' />,
          text: truncateAddress(displayAddress),
          shortText: truncateAddress(displayAddress, 4, 4),
          tooltip: 'Connected with external wallet. Click to disconnect.',
        }
      }
    }

    if (loading) {
      return {
        icon: <Loader2 className='w-4 h-4 mr-2 animate-spin' />,
        text: 'Connecting...',
        shortText: '...',
        tooltip: 'Connecting to wallet...',
      }
    }

    return {
      icon: <Wallet className='w-4 h-4 mr-2' />,
      text: isMiniApp ? 'Connect' : 'Connect Wallet',
      shortText: 'Connect',
      tooltip: 'Connect your wallet to continue',
    }
  }

  const buttonContent = getButtonText()

  return (
    <Button
      onClick={handleConnectWallet}
      {...props}
      className={`bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base whitespace-nowrap ${props.className}`}
      title={buttonContent.tooltip}
    >
      {buttonContent.icon}
      <span className='hidden sm:inline'>{buttonContent.text}</span>
      <span className='sm:hidden'>{buttonContent.shortText}</span>
    </Button>
  )
}

export default ConnectWalletButtonMiniApp
