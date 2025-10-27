import { sdk } from '@farcaster/miniapp-sdk'
import type { Provider } from 'ethers'
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

  // Wallet capabilities
  walletCapabilities: string[]
  supportedChains: string[]
  canPerformSmartContractCalls: boolean
  isExternalWallet: boolean

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
  const [walletCapabilities, setWalletCapabilities] = useState<string[]>([])
  const [supportedChains, setSupportedChains] = useState<string[]>([])
  const [canPerformSmartContractCalls, setCanPerformSmartContractCalls] = useState(false)
  const [isExternalWallet, setIsExternalWallet] = useState(false)

  // Set up wallet polling for account and chain changes (since Farcaster events might not work reliably)
  useEffect(() => {
    if (!isMiniApp || !isInitialized) return

    let provider: Provider | undefined = undefined
    let pollInterval: NodeJS.Timeout
    let lastAccounts: string[] = []
    let lastChainId: string = ''

    const setupAccountPolling = async () => {
      try {
        console.log('🔍 Setting up Farcaster wallet polling...')
        provider = await sdk.wallet.getEthereumProvider()
        if (!provider) {
          console.log('❌ No Farcaster provider available for polling')
          return
        }

        console.log('✅ Farcaster provider obtained, setting up polling', provider)

        // Get initial state
        try {
          const initialAccounts = await provider.request({ method: 'eth_accounts' })
          const initialChainId = await provider.request({ method: 'eth_chainId' })
          lastAccounts = initialAccounts || []
          lastChainId = initialChainId || ''
          console.log('📊 Initial state:', { accounts: lastAccounts, chainId: lastChainId })
        } catch (error) {
          console.error('Error getting initial wallet state:', error)
        }

        // Poll for changes every 2 seconds
        pollInterval = setInterval(async () => {
          try {
            const currentAccounts = await provider.request({ method: 'eth_accounts' })
            const currentChainId = await provider.request({ method: 'eth_chainId' })

            // Check for account changes
            const accountsChanged = JSON.stringify(currentAccounts) !== JSON.stringify(lastAccounts)
            if (accountsChanged) {
              console.log('🔄 Detected account change via polling:', {
                from: lastAccounts,
                to: currentAccounts,
              })
              lastAccounts = currentAccounts || []
              handleAccountChange(currentAccounts || [])
            }

            // Check for chain changes
            if (currentChainId !== lastChainId) {
              console.log('🔄 Detected chain change via polling:', {
                from: lastChainId,
                to: currentChainId,
              })
              lastChainId = currentChainId
              handleChainChange(currentChainId)
            }
          } catch (error) {
            console.error('Error polling wallet state:', error)
          }
        }, 2000) // Poll every 2 seconds

        // Handler functions
        const handleAccountChange = async (accounts: string[]) => {
          console.log('🔄 Processing account change:', accounts)
          try {
            const capabilities = await sdk.getCapabilities()
            const chains = await sdk.getChains()

            setWalletCapabilities(capabilities)
            setSupportedChains(chains)

            // Re-test wallet capabilities
            const hasEthereumProvider = capabilities.includes('wallet.getEthereumProvider')
            const supportsSepoliaChain = chains.includes('eip155:11155111')

            let canPerformSmartContracts = false
            let isExternal = false

            if (hasEthereumProvider && supportsSepoliaChain && accounts.length > 0) {
              try {
                await provider.request({
                  method: 'eth_call',
                  params: [
                    {
                      to: '0x0000000000000000000000000000000000000000',
                      data: '0x',
                    },
                    'latest',
                  ],
                })

                canPerformSmartContracts = true
                isExternal = true
                console.log('✅ Account change: eth_call test successful - external wallet detected')
              } catch (error) {
                console.log('⚠️ Account change: eth_call test failed - likely embedded wallet:', error)
                canPerformSmartContracts = false
                isExternal = false
              }
            }

            setCanPerformSmartContractCalls(canPerformSmartContracts)
            setIsExternalWallet(isExternal)

            console.log('✅ Account change: Updated wallet capabilities:', {
              canPerformSmartContracts,
              isExternal,
              accounts,
            })
          } catch (error) {
            console.error('❌ Error rechecking capabilities after account change:', error)
          }
        }

        const handleChainChange = async (chainId: string) => {
          console.log('🔄 Processing chain change:', chainId)
          try {
            const chains = await sdk.getChains()
            setSupportedChains(chains)
            console.log('✅ Chain change: Updated supported chains:', chains)
          } catch (error) {
            console.error('❌ Error rechecking chains after chain change:', error)
          }
        }
      } catch (error) {
        console.error('❌ Error setting up Farcaster wallet polling:', error)
      }
    }

    setupAccountPolling()

    // Cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        console.log('🧹 Farcaster wallet polling cleaned up')
      }
    }
  }, [isMiniApp, isInitialized])

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

        // Get wallet capabilities and supported chains
        try {
          const capabilities = await sdk.getCapabilities()
          const chains = await sdk.getChains()

          console.log('Wallet capabilities:', capabilities)
          console.log('Supported chains:', chains)

          setWalletCapabilities(capabilities)
          setSupportedChains(chains)

          // Check if wallet supports smart contract calls by testing eth_call
          const hasEthereumProvider = capabilities.includes('wallet.getEthereumProvider')
          const supportsSepoliaChain = chains.includes('eip155:11155111') // Sepolia testnet

          let canPerformSmartContracts = false
          let isExternal = false

          if (hasEthereumProvider && supportsSepoliaChain) {
            try {
              // Test if the wallet can perform eth_call by trying to get the provider
              const provider = await sdk.wallet.getEthereumProvider()
              if (provider) {
                // Try to perform a simple eth_call to test capabilities
                // This is a simple call that should work on any provider
                await provider.request({
                  method: 'eth_call',
                  params: [
                    {
                      to: '0x0000000000000000000000000000000000000000',
                      data: '0x',
                    },
                    'latest',
                  ],
                })

                // If eth_call works, it's likely an external wallet
                canPerformSmartContracts = true
                isExternal = true
                console.log('eth_call test successful - external wallet detected')
              }
            } catch (error) {
              console.log('eth_call test failed - likely embedded wallet (Warpcast):', error)
              // eth_call failed, likely embedded wallet (Warpcast)
              canPerformSmartContracts = false
              isExternal = false
            }
          }

          setCanPerformSmartContractCalls(canPerformSmartContracts)
          setIsExternalWallet(isExternal)

          console.log('Can perform smart contract calls:', canPerformSmartContracts)
          console.log('Is external wallet:', isExternal)
        } catch (error) {
          console.error('Error fetching wallet capabilities:', error)
          // Default to false if we can't determine capabilities
          setCanPerformSmartContractCalls(false)
          setIsExternalWallet(false)
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

    // Wallet capabilities
    walletCapabilities,
    supportedChains,
    canPerformSmartContractCalls,
    isExternalWallet,

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
