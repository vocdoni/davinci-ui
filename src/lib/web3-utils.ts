/**
 * Truncates an Ethereum address to a shorter format
 * @param address The full Ethereum address
 * @param startLength Number of characters to show at start (default: 6)
 * @param endLength Number of characters to show at end (default: 4)
 * @returns Truncated address string
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return ''
  if (address.length < startLength + endLength) return address

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Formats a chain ID to a network name
 * @param chainId The chain ID in hex or decimal format (e.g., "0x1" or "1")
 * @returns Network name string
 */
export function getNetworkName(chainId: string | number): string {
  // Convert to hex if decimal
  const hexChainId = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId

  const networks: { [key: string]: string } = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli',
    '0xaa36a7': 'Sepolia',
    '0x89': 'Polygon',
    '0xa4b1': 'Arbitrum One',
    '0x2105': 'Base',
    '0xa': 'Optimism',
    '0xa4ec': 'Celo',
    '0x13881': 'Mumbai',
  }

  return networks[hexChainId.toLowerCase()] || 'Unknown Network'
}
