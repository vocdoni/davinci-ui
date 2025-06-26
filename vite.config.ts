import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'import.meta.env.SEQUENCER_URL': JSON.stringify(process.env.SEQUENCER_URL || 'https://sequencer1.davinci.vote'),
    'import.meta.env.BIGQUERY_URL': JSON.stringify(process.env.BIGQUERY_URL || 'https://c3.davinci.vote'),
    'import.meta.env.SHARE_TEXT': JSON.stringify(
      process.env.SHARE_TEXT ||
        `🗳️ Just launched a vote with DAVINCI, the anonymous, verifiable & anti-coercion voting protocol by @vocdoni!

"{title}" {link}

Want to create your own vote & earn rewards?
👉 {app}`
    ),
  },
})
