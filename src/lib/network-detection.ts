import { VocdoniApiService } from '@vocdoni/davinci-sdk'
import type { SupportedNetwork } from './network-config'

let cachedNetwork: SupportedNetwork | null = null
let cachedChainId: number | null = null

/**
 * Map chain ID to network name
 */
function mapChainIdToNetwork(chainId: number): SupportedNetwork {
  const mapping: Record<number, SupportedNetwork> = {
    1: 'mainnet',
    11155111: 'sepolia',
    42161: 'arbitrum',
    137: 'polygon',
    8453: 'base',
    10: 'optimism',
    42220: 'celo',
  }
  return mapping[chainId] || 'sepolia' // Default to sepolia if unknown
}

/**
 * Detect the network from the sequencer
 * Caches the result to avoid repeated API calls
 */
export async function detectSequencerNetwork(): Promise<SupportedNetwork> {
  if (cachedNetwork) {
    return cachedNetwork
  }

  try {
    const api = new VocdoniApiService({
      sequencerURL: import.meta.env.SEQUENCER_URL,
      censusURL: import.meta.env.SEQUENCER_URL,
    })

    const info = await api.sequencer.getInfo()

    // Extract chainId from info response
    // The API returns 'network' field which contains the chain ID
    // Using type assertion since the InfoResponse type may not include all fields
    const infoData = info as unknown as { chainId?: number | string; network?: number | string }
    const chainId = infoData.chainId || infoData.network

    if (!chainId) {
      console.warn('⚠️ Sequencer info does not contain chain information, defaulting to Sepolia')
      cachedNetwork = 'sepolia'
      cachedChainId = 11155111
      return cachedNetwork
    }

    const parsedChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : Number(chainId)
    cachedChainId = parsedChainId
    cachedNetwork = mapChainIdToNetwork(parsedChainId)

    console.info(`🔗 Detected sequencer network: ${cachedNetwork} (chainId: ${cachedChainId})`)

    return cachedNetwork
  } catch (error) {
    console.error('Failed to detect sequencer network:', error)
    console.warn('⚠️ Falling back to Sepolia network')
    cachedNetwork = 'sepolia'
    cachedChainId = 11155111
    return cachedNetwork
  }
}

/**
 * Get the cached chain ID from sequencer
 */
export function getSequencerChainId(): number | null {
  return cachedChainId
}

/**
 * Clear the cache (useful for testing)
 */
export function clearNetworkCache(): void {
  cachedNetwork = null
  cachedChainId = null
}
