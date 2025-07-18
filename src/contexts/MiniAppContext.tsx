import { sdk } from '@farcaster/miniapp-sdk'
import React, { createContext, useContext, useEffect, useState } from 'react'

export interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  bio?: string
  location?: {
    placeId: string
    description: string
  }
}

export interface MiniAppLocationContext {
  type: 'cast_embed' | 'cast_share' | 'notification' | 'launcher' | 'channel' | 'open_miniapp'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface WalletConnection {
  address: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any
}

interface MiniAppContextType {
  // State
  isMiniApp: boolean
  isLoading: boolean
  isInitialized: boolean
  user: FarcasterUser | null
  location: MiniAppLocationContext | null

  // Wallet functions
  connectFarcasterWallet: () => Promise<WalletConnection | null>
  isFarcasterWalletConnected: () => Promise<boolean>

  // Utility functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFarcasterEthereumProvider: () => Promise<any>
}

const MiniAppContext = createContext<MiniAppContextType | null>(null)

export const MiniAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [user, setUser] = useState<FarcasterUser | null>(null)
  const [location, setLocation] = useState<MiniAppLocationContext | null>(null)

  // Initialize mini app detection and context
  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        setIsLoading(true)

        // First check if we're in a mini app
        const miniAppDetected = await sdk.isInMiniApp()
        setIsMiniApp(miniAppDetected)

        if (!miniAppDetected) {
          console.log('Not running in mini app mode')
          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        console.log('Mini app detected, initializing...')

        // Get the context asynchronously
        const context = await sdk.context

        // Extract user data (should now be plain objects, not Proxies)
        if (context.user) {
          console.log('Mini app user context:', context.user)
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bio: (context.user as any).bio, // bio might not be in the type definition
            location: context.user.location,
          })
        }

        if (context.location) {
          setLocation(context.location)
        }

        // Call ready to hide splash screen
        await sdk.actions.ready()
        console.log('Mini app initialization complete')
      } catch (error) {
        console.error('Failed to initialize mini app:', error)
        // Even if initialization fails, we should continue
        setIsMiniApp(false)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeMiniApp()
  }, [])

  // Connect to Farcaster wallet
  const connectFarcasterWallet = async (): Promise<WalletConnection | null> => {
    if (!isMiniApp) {
      console.log('Not in mini app, cannot connect Farcaster wallet')
      return null
    }

    try {
      const provider = await getFarcasterEthereumProvider()
      if (!provider) {
        throw new Error('Farcaster provider not available')
      }

      console.log('Requesting Farcaster wallet connection...')
      const accounts = await provider.request({ method: 'eth_requestAccounts' })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Farcaster wallet')
      }

      console.log('Connected to Farcaster wallet:', accounts[0])

      return {
        address: accounts[0],
        provider,
      }
    } catch (error) {
      console.error('Failed to connect Farcaster wallet:', error)
      throw error
    }
  }

  // Check if Farcaster wallet is connected
  const isFarcasterWalletConnected = async (): Promise<boolean> => {
    if (!isMiniApp) {
      return false
    }

    try {
      const provider = await getFarcasterEthereumProvider()
      if (!provider) {
        return false
      }

      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts && accounts.length > 0
    } catch (error) {
      console.error('Error checking Farcaster wallet connection:', error)
      return false
    }
  }

  // Get Farcaster Ethereum provider
  const getFarcasterEthereumProvider = async () => {
    if (!isMiniApp) {
      return null
    }

    try {
      return await sdk.wallet.getEthereumProvider()
    } catch (error) {
      console.error('Error getting Farcaster Ethereum provider:', error)
      return null
    }
  }

  const contextValue: MiniAppContextType = {
    // State
    isMiniApp,
    isLoading,
    isInitialized,
    user,
    location,

    // Functions
    connectFarcasterWallet,
    isFarcasterWalletConnected,
    getFarcasterEthereumProvider,
  }

  return <MiniAppContext.Provider value={contextValue}>{children}</MiniAppContext.Provider>
}

// Custom hook to use the MiniApp context
export const useMiniApp = () => {
  const context = useContext(MiniAppContext)
  if (!context) {
    throw new Error('useMiniApp must be used within a MiniAppProvider')
  }
  return context
}
