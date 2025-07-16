import { sepolia } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { FloatingHeader } from '~components/floating-header'
import { Footer } from '~components/footer'

export function Layout() {
  const { caipNetwork, switchNetwork } = useAppKitNetwork()

  // Switch to configured chain if not connected to Sepolia
  useEffect(() => {
    if (!caipNetwork) return

    // Check if we're on Sepolia (chain ID 11155111)
    if (caipNetwork.id !== sepolia.id) {
      try {
        switchNetwork(sepolia)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
  }, [caipNetwork, switchNetwork])

  return (
    <div className='min-h-screen bg-davinci-paper-base/30 flex flex-col font-work-sans'>
      <FloatingHeader />
      <ScrollRestoration />
      <main className='flex-1 pt-32 pb-16'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
