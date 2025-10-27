import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { NETWORK_MAP } from './network-config'

// 1. Get projectId from environment
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID

// 2. Create a metadata object
const metadata = {
  name: 'DAVINCI',
  description: 'DAVINCI Voting Platform',
  url: 'https://davinci.vote', // origin must match your domain & subdomain
  icons: ['/images/davinci-icon-small.png'],
}

// 3. Get all supported networks
const networks = Object.values(NETWORK_MAP) as [AppKitNetwork, ...AppKitNetwork[]]

// 4. Create Ethers Adapter
const ethersAdapter = new EthersAdapter()

// 5. Create modal with all networks
createAppKit({
  adapters: [ethersAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: false,
    socials: [],
    email: false,
  },
})
