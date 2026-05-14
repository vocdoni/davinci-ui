export async function ensureCorrectNetworkBeforeLaunch(
  isCorrectNetwork: boolean,
  switchToCorrectNetwork: () => Promise<void>
): Promise<void> {
  if (!isCorrectNetwork) {
    await switchToCorrectNetwork()
  }
}

