import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { useMiniApp } from '~contexts/MiniAppContext'

export interface UnifiedWalletState {
  // Connection state
  isConnected: boolean
  address: string | undefined

  // Wallet type indicators
  isFarcasterConnected: boolean
  isAppKitConnected: boolean

  // Farcaster-specific data
  farcasterUser: any
  farcasterAddress: string | null

  // Connection methods
  connectFarcaster: () => Promise<any>
  checkFarcasterConnection: () => Promise<boolean>
}

export const useUnifiedWallet = (): UnifiedWalletState => {
  // AppKit hooks
  const { isConnected: appKitConnected, address: appKitAddress } = useAppKitAccount()

  // MiniApp hooks
  const { isMiniApp, user: farcasterUser, connectFarcasterWallet, isFarcasterWalletConnected } = useMiniApp()

  // Local state for Farcaster connection
  const [farcasterConnected, setFarcasterConnected] = useState(false)
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null)

  // Check Farcaster connection status on mount and when mini app state changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMiniApp) {
        setFarcasterConnected(false)
        setFarcasterAddress(null)
        return
      }

      try {
        const connected = await isFarcasterWalletConnected()
        setFarcasterConnected(connected)

        if (connected) {
          // Try to get the address from Farcaster wallet
          const result = await connectFarcasterWallet()
          if (result?.address) {
            setFarcasterAddress(result.address)
          }
        } else {
          setFarcasterAddress(null)
        }
      } catch (error) {
        console.error('Error checking Farcaster wallet connection:', error)
        setFarcasterConnected(false)
        setFarcasterAddress(null)
      }
    }

    checkConnection()
  }, [isMiniApp, isFarcasterWalletConnected, connectFarcasterWallet])

  // Connect to Farcaster wallet
  const connectFarcaster = async () => {
    if (!isMiniApp) {
      throw new Error('Not in mini app environment')
    }

    try {
      const result = await connectFarcasterWallet()
      if (result?.address) {
        setFarcasterConnected(true)
        setFarcasterAddress(result.address)
        return result
      }
      throw new Error('Failed to get address from Farcaster wallet')
    } catch (error) {
      console.error('Failed to connect Farcaster wallet:', error)
      setFarcasterConnected(false)
      setFarcasterAddress(null)
      throw error
    }
  }

  // Check Farcaster connection (exposed method)
  const checkFarcasterConnection = async () => {
    if (!isMiniApp) return false

    try {
      return await isFarcasterWalletConnected()
    } catch (error) {
      console.error('Error checking Farcaster connection:', error)
      return false
    }
  }

  // Unified state
  const isConnected = appKitConnected || farcasterConnected
  const address = farcasterAddress || appKitAddress

  return {
    // Connection state
    isConnected,
    address,

    // Wallet type indicators
    isFarcasterConnected: farcasterConnected,
    isAppKitConnected: appKitConnected,

    // Farcaster-specific data
    farcasterUser,
    farcasterAddress,

    // Connection methods
    connectFarcaster,
    checkFarcasterConnection,
  }
}
