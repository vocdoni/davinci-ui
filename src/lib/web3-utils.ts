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
 * @param chainId The chain ID in hex format (e.g., "0x1")
 * @returns Network name string
 */
export function getNetworkName(chainId: string): string {
  const networks: { [key: string]: string } = {
    '0x1': 'Ethereum',
    '0x5': 'Goerli',
    '0xaa36a7': 'Sepolia',
    '0x89': 'Polygon',
    '0x13881': 'Mumbai',
  }

  return networks[chainId] || 'Unknown Network'
}
