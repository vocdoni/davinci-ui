import type { ElectionMetadata, GetProcessResponse } from '@vocdoni/davinci-sdk'

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
