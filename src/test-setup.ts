// Mock Worker for tests since @vocdoni/davinci-sdk uses Web Workers
// and jsdom doesn't provide the Worker global
// This must be defined at the top level (not in beforeAll) because
// the SDK accesses Worker during module import time
if (!global.Worker) {
  // Mock Worker constructor
  global.Worker = class Worker {
    url: string | URL
    onmessage = null
    onerror = null
    onmessageerror = null
    
    constructor(url: string | URL) {
      this.url = url
    }
    
    postMessage() {
      // Mock postMessage
    }
    
    terminate() {
      // Mock terminate
    }
    
    addEventListener() {
      // Mock addEventListener
    }
    
    removeEventListener() {
      // Mock removeEventListener
    }
    
    dispatchEvent() {
      return true
    }
  } as any
}
