import { VocdoniApiService } from '@vocdoni/davinci-sdk'
import type { SupportedNetwork } from './network-config'

let cachedSequencerNetwork: SupportedNetwork | null = null
let cachedSequencerChainId: number | null = null
let cachedSequencerInfoNetworks: SequencerInfoNetworkEntry[] | null = null

export interface SequencerInfoNetworkEntry {
  chainId: number
  shortName: string
  processRegistryContract: string
  processIDVersion: string
}

/**
 * Map chain ID to network name
 */
function mapChainIdToNetwork(chainId: number): SupportedNetwork {
  const mapping: Record<number, SupportedNetwork> = {
    1: 'mainnet',
    11155111: 'sepolia',
    42161: 'arbitrum',
    421614: 'arbitrum-sepolia',
    137: 'polygon',
    8453: 'base',
    10: 'optimism',
    42220: 'celo',
  }
  return mapping[chainId] || 'sepolia' // Default to sepolia if unknown
}

function normalizeInfoNetworks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any
): SequencerInfoNetworkEntry[] {
  const candidates = info?.networks ?? info?.network ?? {}
  const values = Object.values(candidates) as Array<{
    chainID?: number | string
    shortName?: string
    processRegistryContract?: string
    processIDVersion?: string
  }>

  return values
    .map((network) => ({
      chainId: Number(network.chainID),
      shortName: network.shortName || '',
      processRegistryContract: network.processRegistryContract || '',
      processIDVersion: network.processIDVersion || '',
    }))
    .filter((network) => Number.isFinite(network.chainId) && network.chainId > 0)
}

export async function getSequencerInfoNetworks(): Promise<SequencerInfoNetworkEntry[]> {
  if (cachedSequencerInfoNetworks) {
    return cachedSequencerInfoNetworks
  }

  const api = new VocdoniApiService({
    sequencerURL: import.meta.env.SEQUENCER_URL,
    censusURL: import.meta.env.SEQUENCER_URL,
  })
  const info = await api.sequencer.getInfo()
  const networks = normalizeInfoNetworks(info)

  if (networks.length === 0) {
    throw new Error('Sequencer /info does not contain any valid network entries')
  }

  cachedSequencerInfoNetworks = networks
  return networks
}

/**
 * Detect the network from the sequencer
 * Caches the result to avoid repeated API calls
 */
export async function detectSequencerNetwork(): Promise<SupportedNetwork> {
  if (cachedSequencerNetwork) {
    return cachedSequencerNetwork
  }

  try {
    const networks = await getSequencerInfoNetworks()
    const chainId = networks[0]?.chainId

    if (!chainId) {
      console.warn('⚠️ Sequencer info does not contain chain information, defaulting to Sepolia')
      cachedSequencerNetwork = 'sepolia'
      cachedSequencerChainId = 11155111
      return cachedSequencerNetwork
    }

    const parsedChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : Number(chainId)
    cachedSequencerChainId = parsedChainId
    cachedSequencerNetwork = mapChainIdToNetwork(parsedChainId)

    console.info(`🔗 Detected sequencer network: ${cachedSequencerNetwork} (chainId: ${cachedSequencerChainId})`)

    return cachedSequencerNetwork
  } catch (error) {
    console.error('Failed to detect sequencer network:', error)
    console.warn('⚠️ Falling back to Sepolia network')
    cachedSequencerNetwork = 'sepolia'
    cachedSequencerChainId = 11155111
    return cachedSequencerNetwork
  }
}

/**
 * Get the cached chain ID from sequencer
 */
export function getSequencerChainId(): number | null {
  return cachedSequencerChainId
}

/**
 * Clear the cache (useful for testing)
 */
export function clearSequencerNetworkCache(): void {
  cachedSequencerNetwork = null
  cachedSequencerChainId = null
  cachedSequencerInfoNetworks = null
}
