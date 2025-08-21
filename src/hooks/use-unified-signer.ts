/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcProvider, type Signer } from 'ethers'
import { useMiniApp } from '~contexts/MiniAppContext'
import { useUnifiedWallet } from './use-unified-wallet'

export interface UnifiedSignerState {
  // Get the appropriate signer with read/write separation for Farcaster
  getSigner: () => Promise<Signer | null>

  // Direct access to providers (for debugging/advanced usage)
  walletProvider: any
  getFarcasterProvider: () => Promise<any>

  // Signer type indicators
  isUsingFarcasterSigner: boolean
  readProvider: JsonRpcProvider | null
}

export const useUnifiedSigner = (): UnifiedSignerState => {
  // AppKit provider
  const { walletProvider } = useAppKitProvider('eip155')

  // MiniApp context
  const { isMiniApp, getFarcasterEthereumProvider } = useMiniApp()

  // Unified wallet state
  const { isFarcasterConnected } = useUnifiedWallet()

  // In miniapp context, use Farcaster signer with separated read provider
  const isUsingFarcasterSigner = isMiniApp && isFarcasterConnected

  // Create read provider for Farcaster (reliable public RPC)
  const readProvider = isUsingFarcasterSigner 
    ? new JsonRpcProvider(import.meta.env.SEPOLIA_RPC_URL)
    : null

  // Get the appropriate signer based on connection state
  const getSigner = async (): Promise<Signer | null> => {
    // In miniapp context with Farcaster connection, use separated read/write providers
    if (isMiniApp && isFarcasterConnected) {
      try {
        // Get Farcaster provider for write operations only
        const farcasterProvider = await getFarcasterEthereumProvider()
        if (!farcasterProvider) {
          console.warn('Farcaster provider not available')
          return null
        }

        // Create write provider and get signer
        const writeProvider = new BrowserProvider(farcasterProvider)
        const signer = await writeProvider.getSigner()

        // Connect signer to read provider for read operations
        // This is the key pattern: reads go through reliable RPC, writes through Farcaster wallet
        if (readProvider) {
          return signer.connect(readProvider)
        }

        // Fallback to regular signer if read provider not available
        return signer
      } catch (error) {
        console.error('Error getting Farcaster signer:', error)
        return null
      }
    }

    // Use AppKit provider for PWA usage (outside miniapp or when AppKit is connected)
    if (walletProvider) {
      try {
        const provider = new BrowserProvider(walletProvider)
        return await provider.getSigner()
      } catch (error) {
        console.error('Error getting AppKit signer:', error)
        return null
      }
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
    // Main signer getter
    getSigner,

    // Direct access to providers
    walletProvider,
    getFarcasterProvider,

    // Signer type indicator
    isUsingFarcasterSigner,
    readProvider,
  }
}