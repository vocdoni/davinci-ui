import { VocdoniApiService } from '@vocdoni/davinci-sdk'
import type { SupportedNetwork } from './network-config'

let cachedSequencerNetwork: SupportedNetwork | null = null
let cachedSequencerChainId: number | null = null

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
  if (cachedSequencerNetwork) {
    return cachedSequencerNetwork
  }

  try {
    // We can't use useVocdoniApi here since this is not a React hook and we
    // need to detect the network before that hook is even initialized
    const api = new VocdoniApiService({
      sequencerURL: import.meta.env.SEQUENCER_URL,
      censusURL: import.meta.env.SEQUENCER_URL,
    })

    const info = await api.sequencer.getInfo()

    const { network } = info
    const chainId = network[Object.keys(network)[0]]

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
}
