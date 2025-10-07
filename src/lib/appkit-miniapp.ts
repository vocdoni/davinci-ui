import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { AppKit, createAppKit } from '@reown/appkit/react'
import { getConfiguredNetwork } from './network-config'

// 1. Get projectId from environment
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID

// 2. Create a metadata object
const metadata = {
  name: 'DAVINCI',
  description: 'DAVINCI Voting Platform',
  url: 'https://farcapp.netlify.app',
  icons: ['/images/davinci-icon-small.png'],
}

// 3. Get configured network
const network = getConfiguredNetwork()

// 4. Create Ethers Adapter with conditional provider
const ethersAdapter = new EthersAdapter()

let appKit: AppKit | null = null

/**
 * Initialize AppKit - simplified version since mini app logic is now in context
 */
export async function initializeAppKit() {
  if (appKit) {
    return appKit
  }

  console.log('Initializing AppKit...')

  // Create standard AppKit (works for both mini app and regular web)
  appKit = createAppKit({
    adapters: [ethersAdapter],
    networks: [network],
    projectId,
    metadata,
    features: {
      analytics: false,
      socials: [],
      email: false,
    },
  })

  return appKit
}

/**
 * Get the current AppKit instance
 */
export function getAppKit() {
  return appKit
}
