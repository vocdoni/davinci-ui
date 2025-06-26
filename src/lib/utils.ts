import { type ClassValue, clsx } from 'clsx'
import { formatDuration, intervalToDuration } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateText = (text: string, limit: number = Infinity, ellipsis: string = '...'): string => {
  if (text.length <= limit) return text

  if (limit <= ellipsis.length) return ellipsis.slice(0, limit)

  const maxTextLength = limit - ellipsis.length
  return text.slice(0, maxTextLength) + ellipsis
}

export const formatNanosecondsInterval = (nanoseconds: number): string => formatInterval(nanoseconds / 1_000_000)

export const formatInterval = (miliseconds: number): string => {
  const duration = intervalToDuration({ start: 0, end: miliseconds })
  return formatDuration(duration)
}
