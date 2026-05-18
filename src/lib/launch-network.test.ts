import { describe, expect, it, vi } from 'vitest'
import { ensureCorrectNetworkBeforeLaunch } from './launch-network'

describe('ensureCorrectNetworkBeforeLaunch', () => {
  it('requests network switch when wallet network is wrong', async () => {
    const switchToCorrectNetwork = vi.fn().mockResolvedValue(undefined)

    await ensureCorrectNetworkBeforeLaunch(false, switchToCorrectNetwork)

    expect(switchToCorrectNetwork).toHaveBeenCalledTimes(1)
  })

  it('does not request network switch when wallet network is already correct', async () => {
    const switchToCorrectNetwork = vi.fn().mockResolvedValue(undefined)

    await ensureCorrectNetworkBeforeLaunch(true, switchToCorrectNetwork)

    expect(switchToCorrectNetwork).not.toHaveBeenCalled()
  })

  it('propagates switching errors to launch flow', async () => {
    const switchError = new Error('switch failed')
    const switchToCorrectNetwork = vi.fn().mockRejectedValue(switchError)

    await expect(ensureCorrectNetworkBeforeLaunch(false, switchToCorrectNetwork)).rejects.toThrow('switch failed')
  })
})

