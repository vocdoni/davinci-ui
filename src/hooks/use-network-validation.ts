import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import {
  getConfiguredChainId,
  getConfiguredNetwork,
  getConfiguredNetworkName,
  isCorrectNetwork,
} from '~lib/network-config'
import { useUnifiedWallet } from './use-unified-wallet'

export interface NetworkValidationState {
  isCorrectNetwork: boolean
  isValidating: boolean
  isSwitching: boolean
  error: Error | null
  requiredChainId: number
  requiredNetworkName: string
  currentChainId: number | undefined
  switchToCorrectNetwork: () => Promise<void>
}

/**
 * Hook to validate and manage network switching for the connected wallet
 * Ensures the wallet is connected to the correct network as configured
 */
export function useNetworkValidation(): NetworkValidationState {
  const { isConnected } = useUnifiedWallet()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const [isValidating, setIsValidating] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const requiredChainId = getConfiguredChainId()
  const requiredNetworkName = getConfiguredNetworkName()
  const currentChainId = chainId ? Number(chainId) : undefined
  const isOnCorrectNetwork = currentChainId ? isCorrectNetwork(currentChainId) : false

  // Validate network when connection state changes
  useEffect(() => {
    if (isConnected && currentChainId) {
      setIsValidating(true)
      const isValid = isCorrectNetwork(currentChainId)
      setIsValidating(false)

      if (!isValid) {
        console.warn(
          `Wallet connected to wrong network. Expected: ${requiredNetworkName} (${requiredChainId}), Got: ${currentChainId}`
        )
      }
    }
  }, [isConnected, currentChainId, requiredChainId, requiredNetworkName])

  /**
   * Switch the wallet to the correct network
   */
  const switchToCorrectNetwork = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    if (isOnCorrectNetwork) {
      return // Already on correct network
    }

    setIsSwitching(true)
    setError(null)

    try {
      // Get the configured network object
      const network = getConfiguredNetwork()

      // Use AppKit's switchNetwork function
      await switchNetwork(network)

      console.info(`Successfully switched to ${requiredNetworkName}`)
    } catch (err) {
      const error = err as Error
      console.error('Failed to switch network:', error)

      // Provide user-friendly error messages
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        setError(new Error('Network switch was rejected. Please try again.'))
      } else if (error.message?.includes('not supported')) {
        setError(
          new Error(
            `Your wallet doesn't support ${requiredNetworkName}. Please add it manually or use a different wallet.`
          )
        )
      } else {
        setError(new Error(`Failed to switch network: ${error.message}`))
      }

      throw error
    } finally {
      setIsSwitching(false)
    }
  }

  return {
    isCorrectNetwork: isOnCorrectNetwork,
    isValidating,
    isSwitching,
    error,
    requiredChainId,
    requiredNetworkName,
    currentChainId,
    switchToCorrectNetwork,
  }
}
