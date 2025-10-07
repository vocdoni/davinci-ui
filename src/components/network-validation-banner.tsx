import { AlertTriangle, Network } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~components/ui/alert'
import { Button } from '~components/ui/button'
import { Spinner } from '~components/ui/spinner'
import { useNetworkValidation } from '~hooks/use-network-validation'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'

/**
 * Banner component that displays network validation status and allows switching networks
 * Shows when wallet is connected to wrong network
 */
export function NetworkValidationBanner() {
  const { isConnected } = useUnifiedWallet()
  const {
    isCorrectNetwork,
    isValidating,
    isSwitching,
    error,
    requiredNetworkName,
    currentChainId,
    switchToCorrectNetwork,
  } = useNetworkValidation()

  // Don't show if not connected
  if (!isConnected) {
    return null
  }

  // Don't show if validating
  if (isValidating) {
    return null
  }

  // Don't show if on correct network
  if (isCorrectNetwork) {
    return null
  }

  return (
    <Alert variant='destructive' className='border-orange-200 bg-orange-50'>
      <AlertTriangle className='h-4 w-4 text-orange-600' />
      <AlertTitle className='text-orange-800'>Wrong Network</AlertTitle>
      <AlertDescription className='text-orange-700'>
        <div className='space-y-3'>
          <p>
            Your wallet is connected to the wrong network. This vote requires the <strong>{requiredNetworkName}</strong>{' '}
            network.
            {currentChainId && (
              <>
                {' '}
                You are currently on chain ID <strong>{currentChainId}</strong>.
              </>
            )}
          </p>

          {error && (
            <div className='bg-red-100 p-3 rounded border border-red-200'>
              <p className='text-sm text-red-800'>{error.message}</p>
            </div>
          )}

          <Button
            onClick={switchToCorrectNetwork}
            disabled={isSwitching}
            className='bg-orange-600 hover:bg-orange-700 text-white'
            size='sm'
          >
            {isSwitching ? (
              <>
                <Spinner className='mr-2' />
                Switching Network...
              </>
            ) : (
              <>
                <Network className='w-4 h-4 mr-2' />
                Switch to {requiredNetworkName}
              </>
            )}
          </Button>

          <p className='text-xs text-orange-600'>
            <strong>Note:</strong> Some wallets may not support automatic network switching. If the switch fails, please
            add and select {requiredNetworkName} manually in your wallet.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
