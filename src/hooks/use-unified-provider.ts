/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcProvider } from 'ethers'
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
  const getProvider = async () => {
    // In miniapp context with Farcaster, use reliable JsonRpcProvider for read operations
    // This ensures consistent read performance across all operations
    if (isMiniApp && isFarcasterConnected) {
      try {
        // For Farcaster miniapps, return reliable JsonRpcProvider for reads
        // This separates read operations from the potentially unreliable Farcaster wallet provider
        return new JsonRpcProvider(import.meta.env.SEPOLIA_RPC_URL)
      } catch (error) {
        console.error('Error creating Farcaster read provider:', error)
        
        // Fallback to Farcaster provider if JsonRpcProvider fails
        try {
          const farcasterProvider = await getFarcasterEthereumProvider()
          if (farcasterProvider) {
            return new BrowserProvider(farcasterProvider)
          }
        } catch (farcasterError) {
          console.error('Error getting Farcaster provider fallback:', farcasterError)
        }
      }
    }

    // Use AppKit provider for PWA usage (outside miniapp or when AppKit is connected)
    if (walletProvider) {
      return walletProvider
    }

    return null
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
