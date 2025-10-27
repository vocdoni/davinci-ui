import { useAppKitNetwork } from '@reown/appkit/react'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { FloatingHeader } from '~components/floating-header'
import { Footer } from '~components/footer'
import { useSequencerNetwork } from '~contexts/sequencer-network'

export function Layout() {
  const { caipNetwork, switchNetwork } = useAppKitNetwork()
  const { sequencerNetwork, isLoadingSequencerNetwork, isManuallyConfigured } = useSequencerNetwork()

  // Auto-switch to sequencer network if not manually configured
  useEffect(() => {
    // Don't auto-switch if:
    // - Still loading sequencer network
    // - No sequencer network detected
    // - Network is manually configured via env var
    // - Wallet not connected yet
    if (isLoadingSequencerNetwork || !sequencerNetwork || isManuallyConfigured || !caipNetwork) {
      return
    }

    // Switch wallet network to match sequencer if they differ
    if (caipNetwork.id !== sequencerNetwork.id) {
      try {
        switchNetwork(sequencerNetwork)
      } catch (error) {
        console.error('Failed to switch to sequencer network:', error)
      }
    }
  }, [caipNetwork, switchNetwork, sequencerNetwork, isLoadingSequencerNetwork, isManuallyConfigured])

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
