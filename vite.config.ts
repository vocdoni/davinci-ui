import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'import.meta.env.SEQUENCER_URL': JSON.stringify(process.env.SEQUENCER_URL || 'https://sequencer1.davinci.vote'),
  },
})
