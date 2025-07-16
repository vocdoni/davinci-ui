import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { InstallPrompt } from '~components/install-prompt'
import { OfflineIndicator } from '~components/offline-indicator'
import { VocdoniApiProvider } from '~components/vocdoni-api-context'
import { RouterProvider } from '~router'
// Initialize AppKit
import '~lib/appkit'

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
      <VocdoniApiProvider>
        <InstallPrompt />
        <RouterProvider />
        <OfflineIndicator />
      </VocdoniApiProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
