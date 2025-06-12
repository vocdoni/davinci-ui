import type { WalletState } from '@web3-onboard/core'
import { ethers } from 'ethers'
import { createContext, useContext, useEffect, useState } from 'react'
import { web3Onboard } from '~lib/web3-onboard'

interface Web3ContextType {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider: ethers.BrowserProvider | null
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  chainId: string | null
}

const Web3Context = createContext<Web3ContextType>({
  connect: async () => {},
  disconnect: async () => {},
  provider: null,
  address: null,
  isConnecting: false,
  isConnected: false,
  chainId: null,
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to wallet updates
    const walletsSub = web3Onboard.state.select('wallets')
    const subscription = walletsSub.subscribe((wallets: WalletState[]) => {
      const connectedWallets = wallets.map(({ label }) => label)
      window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets))

      if (wallets.length === 0) {
        setProvider(null)
        setAddress(null)
        setChainId(null)
        setIsConnected(false)
        return
      }

      const ethersProvider = new ethers.BrowserProvider(wallets[0].provider)
      setProvider(ethersProvider)
      setAddress(wallets[0].accounts[0].address)
      setChainId(wallets[0].chains[0].id)
      setIsConnected(true)
    })

    // Check for previously connected wallets
    const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets') || '[]')

    if (previouslyConnectedWallets.length > 0) {
      web3Onboard.connectWallet({
        autoSelect: {
          label: previouslyConnectedWallets[0],
          disableModals: true,
        },
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const connect = async () => {
    setIsConnecting(true)
    try {
      await web3Onboard.connectWallet()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    const [primaryWallet] = web3Onboard.state.get().wallets
    if (primaryWallet) {
      await web3Onboard.disconnectWallet({ label: primaryWallet.label })
    }
  }

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        provider,
        address,
        isConnecting,
        isConnected,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}
