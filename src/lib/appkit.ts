import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { createAppKit } from '@reown/appkit/react'
import { getConfiguredNetwork } from './network-config'

// 1. Get projectId from environment
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID

// 2. Create a metadata object
const metadata = {
  name: 'DAVINCI',
  description: 'DAVINCI Voting Platform',
  url: 'https://davinci.vote', // origin must match your domain & subdomain
  icons: ['/images/davinci-icon-small.png'],
}

// 3. Get configured network
const network = getConfiguredNetwork()

// 4. Create Ethers Adapter
const ethersAdapter = new EthersAdapter()

// 5. Create modal
createAppKit({
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
