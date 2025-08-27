import { VocdoniApiService } from '@vocdoni/davinci-sdk'
import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react'

interface VocdoniApiContextValue {
  api: VocdoniApiService
}

// Creamos el contexto
const VocdoniApiContext = createContext<VocdoniApiContextValue | undefined>(undefined)

// Provider que inicializa la instancia de la API
export const VocdoniApiProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const apiInstance = useMemo(() => {
    return new VocdoniApiService(import.meta.env.SEQUENCER_URL)
  }, [])

  return <VocdoniApiContext.Provider value={{ api: apiInstance }}>{children}</VocdoniApiContext.Provider>
}

// Hook para acceder al contexto
export const useVocdoniApi = (): VocdoniApiService => {
  const context = useContext(VocdoniApiContext)
  if (!context) {
    throw new Error('useVocdoniApi must be used within a VocdoniApiProvider')
  }
  return context.api
}
