/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppKitProvider } from '@reown/appkit/react'
import { JsonRpcProvider } from 'ethers'
import { useMiniApp } from '~contexts/MiniAppContext'
import { HybridProvider } from '~lib/hybrid-provider'
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
    // In miniapp context with Farcaster, use HybridProvider for read/write separation
    if (isMiniApp && isFarcasterConnected) {
      try {
        console.log('🔀 Creating HybridProvider for Farcaster miniapp')

        // Get Farcaster provider for write operations
        const farcasterProvider = await getFarcasterEthereumProvider()
        if (!farcasterProvider) {
          console.error('Farcaster provider not available')
          return null
        }

        // Create read provider - use simpler approach without explicit network config
        const rpcUrls = [
          import.meta.env.SEPOLIA_RPC_URL,
          'https://ethereum-sepolia-rpc.publicnode.com',
          'https://sepolia.drpc.org',
          'https://rpc.sepolia.org',
        ].filter(Boolean) // Remove any undefined URLs

        console.log('🌐 Available RPC URLs for Sepolia:', rpcUrls)

        let readProvider: JsonRpcProvider | null = null

        // Try to connect to RPC endpoints in order
        for (const rpcUrl of rpcUrls) {
          try {
            console.log(`🔌 Attempting to connect to RPC: ${rpcUrl}`)
            const testProvider = new JsonRpcProvider(rpcUrl)

            // Test the connection by getting chain ID
            const chainId = await testProvider.getNetwork()
            console.log(`✅ Successfully connected to ${rpcUrl}, chainId:`, chainId.chainId)

            readProvider = testProvider
            break
          } catch (error) {
            console.warn(`❌ Failed to connect to RPC ${rpcUrl}:`, error)
            // Continue to next RPC URL
          }
        }

        if (!readProvider) {
          console.error('🚨 All RPC endpoints failed, falling back to Farcaster provider only')
          // Fallback to using only Farcaster provider (no hybrid)
          return farcasterProvider
        }

        // Create write provider (Farcaster wallet)
        const writeProvider = farcasterProvider

        // Return HybridProvider that routes reads to reliable RPC and writes to Farcaster
        return new HybridProvider({
          readProvider,
          writeProvider,
        })
      } catch (error) {
        console.error('Error creating HybridProvider:', error)

        // Fallback to Farcaster provider only
        try {
          const farcasterProvider = await getFarcasterEthereumProvider()
          if (farcasterProvider) {
            console.log('🔄 Using Farcaster provider only as fallback')
            return farcasterProvider
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
