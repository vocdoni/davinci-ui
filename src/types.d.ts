import type { ElectionMetadata, GetProcessResponse } from '@vocdoni/davinci-sdk'

declare global {
  type ProcessLoaderData = {
    id: string
    election: {
      process: GetProcessResponse
      meta: ElectionMetadata
    }
  }

  type Process = {
    process: GetProcessResponse
    meta: ElectionMetadata
  }
}

export {}
