import injectedModule from '@web3-onboard/injected-wallets'
import { init } from '@web3-onboard/react'
import walletConnectModule from '@web3-onboard/walletconnect'

const injected = injectedModule()
const walletConnect = walletConnectModule({
  projectId: import.meta.env.WALLETCONNECT_PROJECT_ID,
})

export const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0xaa36a7',
      token: 'ETH',
      label: 'Sepolia',
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    },
  ],
  appMetadata: {
    name: 'DAVINCI',
    icon: '/images/davinci-icon-small.png',
    description: 'DAVINCI Voting Platform',
  },
  connect: {
    autoConnectLastWallet: true,
  },
  accountCenter: {
    mobile: {
      enabled: false,
      minimal: false,
      position: 'topRight',
    },
    desktop: {
      enabled: false,
      minimal: false,
      position: 'topRight',
    },
  },
})
