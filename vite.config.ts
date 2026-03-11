import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
const viteconfig = defineConfig(({ mode }) => {
  // load env variables from .env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core - separate chunk for React and React DOM
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            
            // Vocdoni SDK - isolate the main SDK
            'vocdoni-sdk': ['@vocdoni/davinci-sdk'],
            
            // Web3 & Wallet - large Web3 libraries
            'web3-vendor': ['ethers', '@reown/appkit', '@reown/appkit-adapter-ethers'],
            
            // UI Libraries - Radix UI components
            'ui-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-label',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
            ],
            
            // TanStack Query - data fetching library
            'query-vendor': ['@tanstack/react-query'],
            
            // DnD Kit - drag and drop
            'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
            
            // Other vendors - remaining dependencies
            'misc-vendor': [
              'lucide-react',
              'date-fns',
              'react-hook-form',
              '@farcaster/miniapp-sdk',
            ],
          },
        },
      },
      // Increase chunk size warning limit to 5000 kB (5 MB)
      // Note: vocdoni-sdk (~4MB) and web3-vendor (~2MB) are large external dependencies
      // that cannot be further split without breaking functionality
      chunkSizeWarningLimit: 5000,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
      },
    },
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        registerType: 'prompt',
        devOptions: {
          enabled: true,
        },
        includeAssets: [
          'favicon.ico',
          'light/apple-touch-icon.png',
          'dark/apple-touch-icon.png',
          'icons/farcaster.svg',
        ],
        manifest: {
          name: 'DAVINCI Voting App',
          short_name: 'DAVINCI',
          description: 'Decentralized voting platform powered by DAVINCI protocol',
          theme_color: '#F5F1E8',
          background_color: '#F5F1E8',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'icons/ic_launcher_mdpi.png',
              sizes: '48x48',
              type: 'image/png',
            },
            {
              src: 'icons/ic_launcher_hdpi.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: 'icons/ic_launcher_xhdpi.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: 'icons/ic_launcher_xxhdpi.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: 'icons/ic_launcher_xxxhdpi.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/ic_launcher_google_play.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/ic_launcher_google_play.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/sequencer1\.davinci\.vote\/.*/,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/c3\.davinci\.vote\/.*/,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'import.meta.env.SEQUENCER_URL': JSON.stringify(process.env.SEQUENCER_URL || 'https://sequencer1.davinci.vote'),
      'import.meta.env.CENSUS3_URL': JSON.stringify(process.env.CENSUS3_URL || 'https://c3.davinci.vote'),
      'import.meta.env.WALLETCONNECT_PROJECT_ID': JSON.stringify(
        process.env.WALLETCONNECT_PROJECT_ID || 'c3b0f8d1e2a4b5c6d7e8f9a0b1c2d3e4'
      ),
      'import.meta.env.ETHEREUM_NETWORK': JSON.stringify(process.env.ETHEREUM_NETWORK),
      'import.meta.env.PUBLIC_MAILCHIMP_URL': JSON.stringify(
        process.env.PUBLIC_MAILCHIMP_URL ||
          'https://vocdoni.us7.list-manage.com/subscribe/post?u=982283974dbc6cc7c5810daa0&amp;id=df559f4c14&amp;v_id=4973&amp;f_id=0030ade4f0'
      ),
      'import.meta.env.SHARE_TEXT': JSON.stringify(
        process.env.SHARE_TEXT ||
          `🗳️ Just launched a vote with DAVINCI, the anonymous, verifiable & anti-coercion voting protocol by @vocdoni!

"{title}" {link}

Want to create your own vote & earn rewards?
👉 {app}`
      ),
    },
  }
})

export default viteconfig
