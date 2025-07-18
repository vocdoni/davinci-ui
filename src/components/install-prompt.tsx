import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~components/ui/button'
import { useInstallPrompt } from '~hooks/use-install-prompt'

export const InstallPrompt = () => {
  const { isInstallable, isInstallableOnSafari, isIOS, installApp } = useInstallPrompt()
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setIsDismissed(true)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Show banner if Chrome/Edge can install OR Safari/iOS can show instructions
  if ((!isInstallable && !isInstallableOnSafari) || isDismissed) {
    return null
  }

  // Determine if this is Safari/iOS that needs instructions
  const showSafariInstructions = isInstallableOnSafari && !isInstallable

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex-shrink-0'>
              {showSafariInstructions ? (
                <svg className='w-5 h-5 text-amber-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M15 8a3 3 0 10-2.977-2.63l-1.94 1.194a3 3 0 100 4.872l1.94 1.194A3 3 0 1015 8zM10 9a1 1 0 11-2 0 1 1 0 012 0z' />
                  <path d='M12.707 2.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0z' />
                </svg>
              ) : (
                <Plus className='w-5 h-5 text-amber-600' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-amber-900'>
                {showSafariInstructions
                  ? 'Add DAVINCI to your home screen'
                  : 'Add DAVINCI to your home screen for quick access'}
              </p>
              <p className='text-xs text-amber-700 mt-1'>
                {showSafariInstructions
                  ? isIOS
                    ? 'Tap the Share button, then "Add to Home Screen"'
                    : 'Click the Share button, then "Add to Dock"'
                  : 'Install the app for a better experience and offline access'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 ml-4'>
            {!showSafariInstructions && (
              <Button
                onClick={handleInstall}
                size='sm'
                className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 h-auto'
              >
                Install
              </Button>
            )}
            <button
              onClick={handleDismiss}
              className='p-1 text-amber-600 hover:text-amber-800 transition-colors'
              aria-label='Dismiss install prompt'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
