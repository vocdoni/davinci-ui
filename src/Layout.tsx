import { useSetChain } from '@web3-onboard/react'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { FloatingHeader } from '~components/floating-header'
import { Footer } from '~components/footer'

export function Layout() {
  const [{ chains, connectedChain }, setChain] = useSetChain()

  // Switch to configured chain if not connected
  useEffect(() => {
    if (!connectedChain || !chains.length) return

    const configuredChain = chains.find((chain) => chain.id === connectedChain.id)

    if (!configuredChain) {
      setChain({
        chainId: chains[0].id,
        chainNamespace: chains[0].namespace,
      }).catch((error) => {
        console.error('Failed to switch chain:', error)
      })
    }
  }, [connectedChain, chains])

  return (
    <div className='min-h-screen bg-davinci-paper-base/30 flex flex-col font-work-sans'>
      <FloatingHeader />
      <main className='flex-1 pt-32 pb-16'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
