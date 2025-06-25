import injectedModule from '@web3-onboard/injected-wallets'
import { init } from '@web3-onboard/react'
import walletConnectModule from '@web3-onboard/walletconnect'

const injected = injectedModule()
const walletConnect = walletConnectModule({
  projectId: 'f9218b6e0683d202d047f1c60de2d681',
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
    icon: '/images/davinci-icon.png',
    description: 'DAVINCI Voting Platform',
  },
  connect: {
    autoConnectLastWallet: true,
  },
  accountCenter: {
    mobile: {
      enabled: true,
      minimal: true,
      position: 'topRight',
    },
    desktop: {
      enabled: true,
      minimal: true,
      position: 'topRight',
    },
  },
})
