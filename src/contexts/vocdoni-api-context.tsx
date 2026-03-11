import { useQueryClient } from '@tanstack/react-query'
import { DavinciSDK, VocdoniApiService } from '@vocdoni/davinci-sdk'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { createContext, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from 'react'
import { useUnifiedProvider } from '~hooks/use-unified-provider'
import { useUnifiedWallet } from '~hooks/use-unified-wallet'

interface VocdoniApiContextValue {
  api: VocdoniApiService
  sdk: DavinciSDK | null
}

// Creamos el contexto
const VocdoniApiContext = createContext<VocdoniApiContextValue | undefined>(undefined)

// Provider que inicializa la instancia de la API
export const VocdoniApiProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useUnifiedWallet()
  const { getProvider } = useUnifiedProvider()
  const queryClient = useQueryClient()

  // Old API instance (backwards compatible)
  const apiInstance = useMemo(() => {
    return new VocdoniApiService({
      sequencerURL: import.meta.env.SEQUENCER_URL,
      censusURL: import.meta.env.SEQUENCER_URL,
    })
  }, [])

  // New SDK instance with dynamic signer
  const [sdkInstance, setSdkInstance] = useState<DavinciSDK | null>(null)

  // Re-initialize SDK when wallet connection changes
  useEffect(() => {
    const initializeSdk = async () => {
      try {
        if (isConnected && address) {
          // Get wallet provider and create signer
          const walletProvider = await getProvider()
          if (walletProvider) {
            const provider = new BrowserProvider(walletProvider as Eip1193Provider)
            const signer = await provider.getSigner()

            // Initialize SDK with signer
            const sdk = new DavinciSDK({
              signer,
              sequencerUrl: import.meta.env.SEQUENCER_URL,
              censusUrl: import.meta.env.CENSUS3_URL,
            })

            await sdk.init()
            setSdkInstance(sdk)
            console.info('✅ DavinciSDK initialized with signer:', address)
          }
        } else {
          // Cannot initialize the sdk without a signer
          setSdkInstance(null)
          console.info('ℹ️ No signer available to initialize DavinciSDK')
        }
      } catch (error) {
        console.error('Failed to initialize DavinciSDK:', error)
        setSdkInstance(null)
      }
    }

    initializeSdk()
  }, [address, isConnected, getProvider])

  // Set up process event listeners to keep React Query cache in sync
  useEffect(() => {
    if (sdkInstance) {
      const invalidateProcessQuery = (processId: string) => {
        const targetId = processId.toLowerCase()

        queryClient.invalidateQueries({
          predicate: (query) => {
            if (query.queryKey[0] !== 'process') return false
            const keyId = query.queryKey[1]
            return typeof keyId === 'string' && keyId.toLowerCase() === targetId
          },
        })
      }

      console.log('[process events] Listeners registered')

      sdkInstance.processes.onProcessResultsSet((processID: string, sender: string, results: bigint[]) => {
        console.log('[onProcessResultsSet] Event fired:', {
          processID,
          sender,
          results: results.map((r) => r.toString()),
        })
        console.log('[onProcessResultsSet] Invalidating process query for:', processID)
        invalidateProcessQuery(processID)
      })

      sdkInstance.processes.onProcessStatusChanged((processID: string, oldStatus: bigint, newStatus: bigint) => {
        console.log('[onProcessStatusChanged] Event fired:', {
          processID,
          oldStatus: oldStatus.toString(),
          newStatus: newStatus.toString(),
        })
        console.log('[onProcessStatusChanged] Invalidating process query for:', processID)
        invalidateProcessQuery(processID)
      })

      // Cleanup function to remove listeners when SDK changes or component unmounts
      return () => {
        console.log('[process events] Removing listeners')
        sdkInstance.processes.removeAllListeners()
      }
    }
  }, [sdkInstance, queryClient])

  return (
    <VocdoniApiContext.Provider value={{ api: apiInstance, sdk: sdkInstance }}>{children}</VocdoniApiContext.Provider>
  )
}

// Hook para acceder al contexto
export const useVocdoniApi = () => {
  const context = useContext(VocdoniApiContext)
  if (!context) {
    throw new Error('useVocdoniApi must be used within a VocdoniApiProvider')
  }
  return context
}
