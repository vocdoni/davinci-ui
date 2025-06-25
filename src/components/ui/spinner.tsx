import { cn } from '~lib/utils'

export const Spinner = ({ className }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} viewBox='0 0 24 24' fill='none'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
  </svg>
)
