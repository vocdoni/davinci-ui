import type { AppKitNetwork } from '@reown/appkit/networks'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSequencerNetworkAsync } from './network-config'

export interface SequencerNetworkContextValue {
  /** The network the sequencer is using (null while loading) */
  sequencerNetwork: AppKitNetwork | null
  /** Whether the sequencer network is currently being detected */
  isLoadingSequencerNetwork: boolean
  /** Error that occurred during detection, if any */
  sequencerNetworkError: Error | null
  /** Whether network was manually configured via env var */
  isManuallyConfigured: boolean
}

const SequencerNetworkContext = createContext<SequencerNetworkContextValue | undefined>(undefined)

export interface SequencerNetworkProviderProps {
  children: ReactNode
}

/**
 * Provider that detects the sequencer network on mount and makes it available to the app
 */
export function SequencerNetworkProvider({ children }: SequencerNetworkProviderProps) {
  const [sequencerNetwork, setSequencerNetwork] = useState<AppKitNetwork | null>(null)
  const [isLoadingSequencerNetwork, setIsLoadingSequencerNetwork] = useState(true)
  const [sequencerNetworkError, setSequencerNetworkError] = useState<Error | null>(null)
  const [isManuallyConfigured] = useState(!!import.meta.env.ETHEREUM_NETWORK)

  useEffect(() => {
    const detectNetwork = async () => {
      try {
        setIsLoadingSequencerNetwork(true)
        setSequencerNetworkError(null)
        const network = await getSequencerNetworkAsync()
        setSequencerNetwork(network)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to detect sequencer network')
        setSequencerNetworkError(err)
        console.error('Failed to detect sequencer network:', err)
      } finally {
        setIsLoadingSequencerNetwork(false)
      }
    }

    detectNetwork()
  }, [])

  return (
    <SequencerNetworkContext.Provider
      value={{
        sequencerNetwork,
        isLoadingSequencerNetwork,
        sequencerNetworkError,
        isManuallyConfigured,
      }}
    >
      {children}
    </SequencerNetworkContext.Provider>
  )
}

/**
 * Hook to access the sequencer network information
 * Throws if used outside of SequencerNetworkProvider
 */
export function useSequencerNetwork(): SequencerNetworkContextValue {
  const context = useContext(SequencerNetworkContext)

  if (context === undefined) {
    throw new Error('useSequencerNetwork must be used within a SequencerNetworkProvider')
  }

  return context
}

/**
 * Helper to get the chain ID of the sequencer network
 */
export function getSequencerNetworkChainId(network: AppKitNetwork | null): number | null {
  if (!network) return null
  return Number(network.id)
}

/**
 * Helper to get the name of the sequencer network
 */
export function getSequencerNetworkName(network: AppKitNetwork | null): string | null {
  if (!network) return null
  return network.name
}

/**
 * Helper to check if a wallet chain ID matches the sequencer network
 */
export function isMatchingSequencerNetwork(walletChainId: number | string | undefined, sequencerNetwork: AppKitNetwork | null): boolean {
  if (!sequencerNetwork || walletChainId === undefined) return false

  const chainIdNum = typeof walletChainId === 'string' ? parseInt(walletChainId, 10) : Number(walletChainId)
  const sequencerChainId = Number(sequencerNetwork.id)

  return chainIdNum === sequencerChainId
}
