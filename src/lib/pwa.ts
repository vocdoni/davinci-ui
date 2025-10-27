import { registerSW } from 'virtual:pwa-register'

// State management for update prompt
let needRefreshCallback: (() => void) | null = null
let offlineReadyCallback: (() => void) | null = null

// Register service worker with update handling
export const updateSW = registerSW({
  onNeedRefresh() {
    // Trigger the update prompt component
    if (needRefreshCallback) {
      needRefreshCallback()
    }
  },
  onOfflineReady() {
    // Notify that app is ready for offline use
    if (offlineReadyCallback) {
      offlineReadyCallback()
    }
  },
})

// Hook for UpdatePrompt component to register callback
export const onNeedRefresh = (callback: () => void) => {
  needRefreshCallback = callback
}

// Hook for offline ready notification (optional)
export const onOfflineReady = (callback: () => void) => {
  offlineReadyCallback = callback
}
