import init from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'

const injected = injectedModule()
const walletConnect = walletConnectModule({
  projectId: 'f9218b6e0683d202d047f1c60de2d681',
})

export const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/',
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli',
      rpcUrl: 'https://goerli.infura.io/v3/',
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
      enabled: false,
    },
    desktop: {
      enabled: false,
    },
  },
})
