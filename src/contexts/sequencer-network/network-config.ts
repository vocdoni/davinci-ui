import type { AppKitNetwork } from '@reown/appkit/networks'
import { arbitrum, base, celo, mainnet, optimism, polygon, sepolia } from '@reown/appkit/networks'
import { getSequencerInfoNetworks } from './sequencer-network-detection'

/**
 * Supported network identifiers that can be configured via environment variables
 */
export type SupportedNetwork =
  | 'mainnet'
  | 'sepolia'
  | 'arbitrum'
  | 'arbitrum-sepolia'
  | 'polygon'
  | 'base'
  | 'optimism'
  | 'celo'

/**
 * Map of network identifiers to their AppKit network configurations
 */
export const NETWORK_MAP: Record<SupportedNetwork, AppKitNetwork> = {
  mainnet,
  sepolia,
  arbitrum,
  'arbitrum-sepolia': {
    id: 421614,
    name: 'Arbitrum Sepolia',
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:421614',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia-rollup.arbitrum.io/rpc'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Arbiscan',
        url: 'https://sepolia.arbiscan.io',
      },
    },
  } as AppKitNetwork,
  polygon,
  base,
  optimism,
  celo,
}

const CHAIN_ID_TO_NETWORK: Record<number, AppKitNetwork> = {
  1: mainnet,
  11155111: sepolia,
  42161: arbitrum,
  421614: NETWORK_MAP['arbitrum-sepolia'],
  137: polygon,
  8453: base,
  10: optimism,
  42220: celo,
}

export function getNetworkByChainId(chainId: number): AppKitNetwork | null {
  return CHAIN_ID_TO_NETWORK[chainId] || null
}

/**
 * Get the configured network - async version that detects from sequencer
 * If no env var is set, auto-detects from sequencer
 * If env var is set, validates against sequencer and warns on mismatch
 */
export async function getSequencerNetworkAsync(): Promise<AppKitNetwork> {
  const networkEnv = import.meta.env.ETHEREUM_NETWORK as SupportedNetwork | undefined
  const sequencerNetworks = await getSequencerInfoNetworks()
  const supportedSequencerNetworks = sequencerNetworks
    .map((entry) => getNetworkByChainId(entry.chainId))
    .filter((network): network is AppKitNetwork => Boolean(network))
  const fallbackSequencerNetwork = supportedSequencerNetworks[0] || sepolia

  // If no env var configured, use sequencer network (auto-detection)
  if (!networkEnv) {
    return fallbackSequencerNetwork
  }

  // Env var is configured - validate it
  const network = NETWORK_MAP[networkEnv]

  if (!network) {
    console.error(`Invalid ETHEREUM_NETWORK: ${networkEnv}, falling back to sequencer-supported network`)
    return fallbackSequencerNetwork
  }

  const isEnvNetworkSupported = supportedSequencerNetworks.some((candidate) => Number(candidate.id) === Number(network.id))
  if (!isEnvNetworkSupported) {
    console.warn(
      `⚠️ Configured ETHEREUM_NETWORK (${networkEnv}) is not exposed by sequencer /info. ` +
        `The app will still use it, but transaction flows may fail.`
    )
  }

  return network
}

/**
 * Get network explorer URL for a given network
 */
export function getNetworkExplorerUrl(network: AppKitNetwork): string | undefined {
  return network.blockExplorers?.default?.url
}
