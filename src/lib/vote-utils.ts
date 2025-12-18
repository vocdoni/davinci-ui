export function getBinaryArray(positions: string[], value: number = 1): number[] {
  const result = Array(8).fill(0)
  positions.forEach((posStr) => {
    const pos = parseInt(posStr, 10)
    if (!Number.isNaN(pos) && pos >= 0 && pos < 8) {
      result[pos] = value
    }
  })
  return result
}

export function padTo(arr: number[], length: number = 8): number[] {
  return arr.concat(Array(Math.max(0, length - arr.length)).fill(0)).slice(0, length)
}

