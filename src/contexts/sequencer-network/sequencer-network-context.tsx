import type { AppKitNetwork } from '@reown/appkit/networks'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getNetworkByChainId, getSequencerNetworkAsync } from './network-config'
import { getSequencerInfoNetworks } from './sequencer-network-detection'

const NETWORK_STORAGE_KEY = 'davinci.selectedSequencerChainId'

export interface SequencerNetworkOption {
  chainId: number
  label: string
  network: AppKitNetwork | null
}

export interface SequencerNetworkContextValue {
  /** Selected target network (null while loading) */
  sequencerNetwork: AppKitNetwork | null
  /** Alias of selected target network for readability */
  selectedSequencerNetwork: AppKitNetwork | null
  /** All supported networks exposed by sequencer /info */
  availableSequencerNetworks: AppKitNetwork[]
  /** All sequencer networks exposed by /info, including unknown chain IDs */
  availableSequencerNetworkOptions: SequencerNetworkOption[]
  /** Update selected network by chain ID */
  setSelectedSequencerNetwork: (chainId: number) => void
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

function readPersistedChainId(): number | null {
  try {
    const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      window.localStorage.removeItem(NETWORK_STORAGE_KEY)
      return null
    }
    return parsed
  } catch (error) {
    console.warn('Unable to read selected sequencer chain ID from storage:', error)
    return null
  }
}

function persistChainId(chainId: number): void {
  try {
    window.localStorage.setItem(NETWORK_STORAGE_KEY, String(chainId))
  } catch (error) {
    console.warn('Unable to persist selected sequencer chain ID:', error)
  }
}

/**
 * Provider that detects the sequencer network on mount and makes it available to the app
 */
export function SequencerNetworkProvider({ children }: SequencerNetworkProviderProps) {
  const [selectedSequencerNetwork, setSelectedSequencerNetworkState] = useState<AppKitNetwork | null>(null)
  const [availableSequencerNetworks, setAvailableSequencerNetworks] = useState<AppKitNetwork[]>([])
  const [availableSequencerNetworkOptions, setAvailableSequencerNetworkOptions] = useState<SequencerNetworkOption[]>([])
  const [isLoadingSequencerNetwork, setIsLoadingSequencerNetwork] = useState(true)
  const [sequencerNetworkError, setSequencerNetworkError] = useState<Error | null>(null)
  const [isManuallyConfigured] = useState(!!import.meta.env.ETHEREUM_NETWORK)

  useEffect(() => {
    const detectNetwork = async () => {
      try {
        setIsLoadingSequencerNetwork(true)
        setSequencerNetworkError(null)
        const [defaultNetwork, infoNetworks] = await Promise.all([getSequencerNetworkAsync(), getSequencerInfoNetworks()])
        const allNetworkOptions: SequencerNetworkOption[] = infoNetworks.map((entry) => {
          const knownNetwork = getNetworkByChainId(entry.chainId)
          return {
            chainId: entry.chainId,
            label: knownNetwork?.name || `Chain ${entry.chainId}`,
            network: knownNetwork,
          }
        })

        const parsedNetworks = infoNetworks
          .map((entry) => getNetworkByChainId(entry.chainId))
          .filter((network): network is AppKitNetwork => Boolean(network))
        const uniqueNetworks = Array.from(new Map(parsedNetworks.map((network) => [Number(network.id), network])).values())
        const availableNetworks = uniqueNetworks.length > 0 ? uniqueNetworks : [defaultNetwork]

        setAvailableSequencerNetworks(availableNetworks)
        setAvailableSequencerNetworkOptions(allNetworkOptions)

        const persistedChainId = readPersistedChainId()
        const persistedNetwork = availableNetworks.find((network) => Number(network.id) === persistedChainId) || null

        setSelectedSequencerNetworkState(persistedNetwork || defaultNetwork)
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

  const setSelectedSequencerNetwork = (chainId: number) => {
    const selected = availableSequencerNetworks.find((network) => Number(network.id) === chainId)
    if (!selected) {
      console.warn(`Requested unsupported sequencer chain ID: ${chainId}`)
      return
    }

    persistChainId(chainId)
    setSelectedSequencerNetworkState(selected)
  }

  return (
    <SequencerNetworkContext.Provider
      value={{
        sequencerNetwork: selectedSequencerNetwork,
        selectedSequencerNetwork,
        availableSequencerNetworks,
        availableSequencerNetworkOptions,
        setSelectedSequencerNetwork,
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
