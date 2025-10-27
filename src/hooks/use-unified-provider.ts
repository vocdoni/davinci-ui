/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppKitProvider } from '@reown/appkit/react'
import { useCallback } from 'react'
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

  // In miniapp context, always use Farcaster provider (which handles both embedded and external wallets)
  const isUsingFarcasterProvider = isMiniApp && isFarcasterConnected

  // Get the appropriate provider based on connection state
  const getProvider = useCallback(async () => {
    // In miniapp context, always use Farcaster provider
    // This handles both embedded (Warpcast) and external wallets selected through Farcaster client
    if (isMiniApp && isFarcasterConnected) {
      try {
        const farcasterProvider = await getFarcasterEthereumProvider()
        if (farcasterProvider) {
          return farcasterProvider
        }
        console.warn('Farcaster provider not available')
      } catch (error) {
        console.error('Error getting Farcaster provider:', error)
      }
    }

    // Use AppKit provider for PWA usage (outside miniapp or when AppKit is connected)
    if (walletProvider) {
      return walletProvider
    }

    return null
  }, [isMiniApp, isFarcasterConnected, getFarcasterEthereumProvider, walletProvider])

  // Direct access to Farcaster provider
  const getFarcasterProvider = useCallback(async () => {
    if (!isMiniApp) {
      throw new Error('Not in mini app environment')
    }

    return await getFarcasterEthereumProvider()
  }, [isMiniApp, getFarcasterEthereumProvider])

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
