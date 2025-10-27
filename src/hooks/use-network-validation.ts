import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import {
  getSequencerNetworkChainId,
  getSequencerNetworkName,
  isMatchingSequencerNetwork,
  useSequencerNetwork,
} from '~contexts/sequencer-network'
import { useUnifiedWallet } from './use-unified-wallet'

export interface NetworkValidationState {
  isCorrectNetwork: boolean
  isValidating: boolean
  isSwitching: boolean
  error: Error | null
  requiredChainId: number | null
  requiredNetworkName: string | null
  currentChainId: number | undefined
  switchToCorrectNetwork: () => Promise<void>
}

/**
 * Hook to validate and manage network switching for the connected wallet
 * Ensures the wallet is connected to the same network as the sequencer
 */
export function useNetworkValidation(): NetworkValidationState {
  const { isConnected } = useUnifiedWallet()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const { sequencerNetwork, isLoadingSequencerNetwork } = useSequencerNetwork()
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const requiredChainId = getSequencerNetworkChainId(sequencerNetwork)
  const requiredNetworkName = getSequencerNetworkName(sequencerNetwork)
  const currentChainId = chainId ? Number(chainId) : undefined
  const isOnCorrectNetwork = isMatchingSequencerNetwork(currentChainId, sequencerNetwork)

  // Validate network when connection state changes
  useEffect(() => {
    if (isConnected && currentChainId && !isLoadingSequencerNetwork && sequencerNetwork) {
      const isValid = isMatchingSequencerNetwork(currentChainId, sequencerNetwork)

      if (!isValid) {
        console.warn(
          `Wallet connected to wrong network. Expected: ${requiredNetworkName} (${requiredChainId}), Got: ${currentChainId}`
        )
      }
    }
  }, [isConnected, currentChainId, requiredChainId, requiredNetworkName, isLoadingSequencerNetwork, sequencerNetwork])

  /**
   * Switch the wallet to the sequencer network
   */
  const switchToCorrectNetwork = async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    if (!sequencerNetwork) {
      throw new Error('Sequencer network not detected yet')
    }

    if (isOnCorrectNetwork) {
      return // Already on correct network
    }

    setIsSwitching(true)
    setError(null)

    try {
      // Use AppKit's switchNetwork function
      await switchNetwork(sequencerNetwork)

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
    isValidating: isLoadingSequencerNetwork,
    isSwitching,
    error,
    requiredChainId,
    requiredNetworkName,
    currentChainId,
    switchToCorrectNetwork,
  }
}
