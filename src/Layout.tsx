import type { AppKitNetwork } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { FloatingHeader } from '~components/floating-header'
import { Footer } from '~components/footer'
import { getConfiguredNetworkAsync } from '~lib/network-config'

export function Layout() {
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const [detectedNetwork, setDetectedNetwork] = useState<AppKitNetwork | null>(null)
  const [shouldAutoSwitch, setShouldAutoSwitch] = useState(false)

  // Detect network once on mount and cache it
  useEffect(() => {
    const initializeNetworkDetection = async () => {
      try {
        // Check if network is manually configured
        const isManuallyConfigured = !!import.meta.env.ETHEREUM_NETWORK

        // This will detect sequencer network and validate against env var
        const network = await getConfiguredNetworkAsync()
        setDetectedNetwork(network)

        // Only auto-switch if network was NOT manually configured
        setShouldAutoSwitch(!isManuallyConfigured)
      } catch (error) {
        console.error('Failed to initialize network detection:', error)
      }
    }

    initializeNetworkDetection()
  }, [])

  // Switch to detected network only if auto-detection is enabled
  useEffect(() => {
    if (!caipNetwork || !detectedNetwork || !shouldAutoSwitch) return

    // Only switch if using auto-detection (no manual env var configuration)
    if (caipNetwork.id !== detectedNetwork.id) {
      try {
        switchNetwork(detectedNetwork)
      } catch (error) {
        console.error('Failed to switch to detected network:', error)
      }
    }
  }, [caipNetwork, switchNetwork, detectedNetwork, shouldAutoSwitch])

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
