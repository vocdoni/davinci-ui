import { WifiOff } from 'lucide-react'
import { useNetworkStatus } from '~hooks/use-network-status'

export const OfflineIndicator = () => {
  const isOnline = useNetworkStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className='fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto'>
      <div className='bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-lg'>
        <div className='flex items-center gap-3'>
          <WifiOff className='w-5 h-5 text-red-600 flex-shrink-0' />
          <div>
            <p className='text-sm font-medium text-red-900'>No internet connection</p>
            <p className='text-xs text-red-700 mt-1'>Some features may not be available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
