import { RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~components/ui/button'
import { onNeedRefresh, updateSW } from '~lib/pwa'

export const UpdatePrompt = () => {
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Register callback for when service worker has an update
    onNeedRefresh(() => {
      setNeedsUpdate(true)
    })
  }, [])

  const handleUpdate = async () => {
    // Call updateSW to activate the new service worker and reload
    await updateSW(true)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Note: Update will still be applied on next page load
  }

  if (!needsUpdate || isDismissed) {
    return null
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex-shrink-0'>
              <RefreshCw className='w-5 h-5 text-blue-600' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-blue-900'>New version available!</p>
              <p className='text-xs text-blue-700 mt-1'>
                Click "Update Now" to get the latest features and improvements
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 ml-4'>
            <Button
              onClick={handleUpdate}
              size='sm'
              className='bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-auto'
            >
              Update Now
            </Button>
            <button
              onClick={handleDismiss}
              className='p-1 text-blue-600 hover:text-blue-800 transition-colors'
              aria-label='Dismiss update prompt'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
