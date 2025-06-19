import { Web3OnboardProvider } from '@web3-onboard/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { web3Onboard } from '~lib/web3-onboard'
import { router } from '~router'

import '@fontsource/averia-libre/400.css'
import '@fontsource/averia-libre/700.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/700.css'
import './styles/globals.css'

// Set up font variables
document.documentElement.style.setProperty('--font-work-sans', 'Work Sans Variable, sans-serif')
document.documentElement.style.setProperty('--font-averia-libre', 'Averia Libre, serif')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <RouterProvider router={router} />
    </Web3OnboardProvider>
  </React.StrictMode>
)
