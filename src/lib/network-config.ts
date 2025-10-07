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
 * Defaults to Sepolia if not specified or invalid
 */
export function getConfiguredNetwork(): AppKitNetwork {
  const networkEnv = import.meta.env.ETHEREUM_NETWORK as SupportedNetwork | undefined

  if (!networkEnv) {
    console.warn('ETHEREUM_NETWORK not configured, defaulting to Sepolia')
    return sepolia
  }

  const network = NETWORK_MAP[networkEnv]

  if (!network) {
    console.error(`Invalid ETHEREUM_NETWORK: ${networkEnv}, defaulting to Sepolia`)
    return sepolia
  }

  console.info(`Using configured network: ${networkEnv}`)
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
