import type { AppKitNetwork } from '@reown/appkit/networks'
import { arbitrum, base, celo, mainnet, optimism, polygon, sepolia } from '@reown/appkit/networks'
import { detectSequencerNetwork } from './sequencer-network-detection'

/**
 * Supported network identifiers that can be configured via environment variables
 */
export type SupportedNetwork = 'mainnet' | 'sepolia' | 'arbitrum' | 'polygon' | 'base' | 'optimism' | 'celo'

/**
 * Map of network identifiers to their AppKit network configurations
 */
export const NETWORK_MAP: Record<SupportedNetwork, AppKitNetwork> = {
  mainnet,
  sepolia,
  arbitrum,
  polygon,
  base,
  optimism,
  celo,
}

/**
 * Get the configured network - async version that detects from sequencer
 * If no env var is set, auto-detects from sequencer
 * If env var is set, validates against sequencer and warns on mismatch
 */
export async function getSequencerNetworkAsync(): Promise<AppKitNetwork> {
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
 * Get network explorer URL for a given network
 */
export function getNetworkExplorerUrl(network: AppKitNetwork): string | undefined {
  return network.blockExplorers?.default?.url
}
