import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

// 1. Get projectId from environment
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID

// 2. Create a metadata object
const metadata = {
  name: 'DAVINCI',
  description: 'DAVINCI Voting Platform',
  url: 'https://app.davinci.vote',
  icons: ['/images/davinci-icon-small.png'],
}

// 3. Create Ethers Adapter
const ethersAdapter = new EthersAdapter()

// 4. Create modal
createAppKit({
  adapters: [ethersAdapter],
  networks: [sepolia, mainnet],
  projectId,
  metadata,
  features: {
    analytics: false,
    socials: [],
    email: false,
  },
  defaultNetwork: sepolia,
})
