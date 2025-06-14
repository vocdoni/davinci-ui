import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Web3Provider } from '~contexts/Web3Context'
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
    <Web3Provider>
      <RouterProvider router={router} />
    </Web3Provider>
  </React.StrictMode>
)
