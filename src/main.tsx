import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3OnboardProvider } from '@web3-onboard/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { VocdoniApiProvider } from '~components/vocdoni-api-context'
import { web3Onboard } from '~lib/web3-onboard'
import { RouterProvider } from '~router'

import '@fontsource/averia-libre/400.css'
import '@fontsource/averia-libre/700.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'
import './styles/globals.css'

const queryClient = new QueryClient()

// Set up font variables
document.documentElement.style.setProperty('--font-work-sans', 'Work Sans, sans-serif')
document.documentElement.style.setProperty('--font-averia-libre', 'Averia Libre, serif')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <VocdoniApiProvider>
          <RouterProvider />
        </VocdoniApiProvider>
      </Web3OnboardProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
