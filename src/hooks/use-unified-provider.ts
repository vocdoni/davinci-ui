import { useAppKitProvider } from '@reown/appkit/react'
import { useMiniApp } from '~contexts/MiniAppContext'
import { useUnifiedWallet } from './use-unified-wallet'

export interface UnifiedProviderState {
  // Get the appropriate provider (Farcaster or regular)
  getProvider: () => Promise<any>

  // Direct access to providers
  walletProvider: any
  getFarcasterProvider: () => Promise<any>

  // Provider type indicator
  isUsingFarcasterProvider: boolean
}

export const useUnifiedProvider = (): UnifiedProviderState => {
  // AppKit provider
  const { walletProvider } = useAppKitProvider('eip155')

  // MiniApp context
  const { isMiniApp, getFarcasterEthereumProvider } = useMiniApp()

  // Unified wallet state
  const { isFarcasterConnected } = useUnifiedWallet()

  // Determine if we should use Farcaster provider
  const isUsingFarcasterProvider = isMiniApp && isFarcasterConnected

  // Get the appropriate provider based on connection state
  const getProvider = async () => {
    if (isUsingFarcasterProvider) {
      try {
        const farcasterProvider = await getFarcasterEthereumProvider()
        if (farcasterProvider) {
          return farcasterProvider
        }
        console.warn('Farcaster provider not available, falling back to wallet provider')
      } catch (error) {
        console.error('Error getting Farcaster provider, falling back to wallet provider:', error)
      }
    }

    return walletProvider
  }

  // Direct access to Farcaster provider
  const getFarcasterProvider = async () => {
    if (!isMiniApp) {
      throw new Error('Not in mini app environment')
    }

    return await getFarcasterEthereumProvider()
  }

  return {
    // Main provider getter
    getProvider,

    // Direct access to providers
    walletProvider,
    getFarcasterProvider,

    // Provider type indicator
    isUsingFarcasterProvider,
  }
}
