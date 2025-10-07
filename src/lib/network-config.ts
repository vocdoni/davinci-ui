import type { AppKitNetwork } from '@reown/appkit/networks'
import { arbitrum, base, mainnet, optimism, polygon, sepolia, celo } from '@reown/appkit/networks'

/**
 * Supported network identifiers that can be configured via environment variables
 */
export type SupportedNetwork = 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'base' | 'optimism' | 'celo'

/**
 * Map of network identifiers to their AppKit network configurations
 */
const NETWORK_MAP: Record<SupportedNetwork, AppKitNetwork> = {
  mainnet,
  sepolia,
  arbitrum,
  polygon,
  base,
  optimism,
  celo,
}

/**
 * Get the configured network from environment variables
 * If no env var is set, auto-detects from sequencer
 * If env var is set, validates against sequencer and warns on mismatch
 */
export async function getConfiguredNetworkAsync(): Promise<AppKitNetwork> {
  const { detectSequencerNetwork } = await import('./network-detection')
  const networkEnv = import.meta.env.ETHEREUM_NETWORK as SupportedNetwork | undefined

  // Detect sequencer network
  const sequencerNetwork = await detectSequencerNetwork()

  // If no env var configured, use sequencer network (auto-detection)
  if (!networkEnv) {
    console.info(`🔗 Auto-detected network from sequencer: ${sequencerNetwork}`)
    return NETWORK_MAP[sequencerNetwork] || sepolia
  }

  // Env var is configured - validate it
  const network = NETWORK_MAP[networkEnv]

  if (!network) {
    console.error(`Invalid ETHEREUM_NETWORK: ${networkEnv}, falling back to sequencer network: ${sequencerNetwork}`)
    return NETWORK_MAP[sequencerNetwork] || sepolia
  }

  // Check for mismatch between configured and sequencer network
  if (networkEnv !== sequencerNetwork) {
    console.warn(
      `⚠️ Network configuration mismatch!\n` +
        `   Configured: ${networkEnv}\n` +
        `   Sequencer:  ${sequencerNetwork}\n` +
        `   The app will use "${networkEnv}" but votes may fail if sequencer expects "${sequencerNetwork}".`
    )
  } else {
    console.info(`✅ Network configuration matches sequencer: ${networkEnv}`)
  }

  return network
}

/**
 * Synchronous version - gets configured network from env var only
 * Used for initial setup before async detection is available
 * Returns Sepolia as temporary placeholder when no env var is set
 * (actual network will be determined by async detection)
 */
export function getConfiguredNetwork(): AppKitNetwork {
  const networkEnv = import.meta.env.ETHEREUM_NETWORK as SupportedNetwork | undefined

  if (!networkEnv) {
    // Return Sepolia as temporary placeholder
    // The actual network will be set by getConfiguredNetworkAsync()
    return sepolia
  }

  const network = NETWORK_MAP[networkEnv]

  if (!network) {
    console.error(`Invalid ETHEREUM_NETWORK: ${networkEnv}, defaulting to Sepolia`)
    return sepolia
  }

  return network
}

/**
 * Get the chain ID of the configured network
 */
export function getConfiguredChainId(): number {
  const network = getConfiguredNetwork()
  return Number(network.id)
}

/**
 * Get the CAIP-2 network ID of the configured network
 */
export function getConfiguredCaipNetworkId(): string {
  const network = getConfiguredNetwork()
  return `eip155:${network.id}`
}

/**
 * Get the name of the configured network
 */
export function getConfiguredNetworkName(): string {
  const network = getConfiguredNetwork()
  return network.name
}

/**
 * Check if a given chain ID matches the configured network
 */
export function isCorrectNetwork(chainId: number | string): boolean {
  const configuredChainId = getConfiguredChainId()
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId
  return chainIdNum === configuredChainId
}

/**
 * Get network explorer URL for the configured network
 */
export function getNetworkExplorerUrl(): string | undefined {
  const network = getConfiguredNetwork()
  return network.blockExplorers?.default?.url
}
