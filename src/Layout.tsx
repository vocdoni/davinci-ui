import { sepolia } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { FloatingHeader } from '~components/floating-header'
import { Footer } from '~components/footer'
import { useMiniApp } from '~contexts/MiniAppContext'
import { initializeAppKit } from '~lib/appkit-miniapp'

export function Layout() {
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { isInitialized } = useMiniApp()
  const [appKitInitialized, setAppKitInitialized] = useState(false)

  // Initialize AppKit once mini app context is ready
  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) return

      try {
        // Initialize AppKit with conditional Farcaster support
        await initializeAppKit()
        setAppKitInitialized(true)
      } catch (error) {
        console.error('Failed to initialize AppKit:', error)
        setAppKitInitialized(true) // Still allow app to continue
      }
    }

    initialize()
  }, [isInitialized])

  // Switch to configured chain if not connected to Sepolia
  useEffect(() => {
    if (!caipNetwork || !appKitInitialized) return

    // Check if we're on Sepolia (chain ID 11155111)
    if (caipNetwork.id !== sepolia.id) {
      try {
        switchNetwork(sepolia)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
  }, [caipNetwork, switchNetwork, appKitInitialized])

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
