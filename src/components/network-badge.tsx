import { useAppKitNetwork } from '@reown/appkit/react'

/**
 * Network badge component that displays the current network name
 * Shows next to the logo in the header
 */
export function NetworkBadge() {
  const { caipNetwork } = useAppKitNetwork()

  /**
   * Get color classes based on network type
   * Mainnet: green, Testnets: orange/yellow
   */
  const getNetworkColor = (name: string): string => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes('mainnet') || lowerName === 'ethereum') {
      return 'bg-green-100 text-green-700 border-green-200'
    }

    // Testnets and other networks
    return 'bg-orange-100 text-orange-700 border-orange-200'
  }

  // Don't show badge if no network is connected
  if (!caipNetwork) {
    return null
  }

  // Extract network name (remove "Mainnet" suffix if present for cleaner display)
  const displayName = caipNetwork.name.replace(' Mainnet', '')

  return (
    <div
      className={`hidden sm:flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getNetworkColor(caipNetwork.name)}`}
      title={`Connected to ${caipNetwork.name} (Chain ID: ${caipNetwork.id})`}
    >
      <div className='w-1.5 h-1.5 rounded-full bg-current mr-1.5' />
      {displayName}
    </div>
  )
}
