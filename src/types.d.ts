import type { ElectionMetadata, GetProcessResponse } from '@vocdoni/davinci-sdk'

type ProcessLoaderData = {
  id: string
  process: GetProcessResponse
  meta: ElectionMetadata
}
