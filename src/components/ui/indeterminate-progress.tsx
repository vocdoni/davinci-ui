'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import { cn } from '~lib/utils'

const IndeterminateProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-davinci-digital-highlight', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className='h-full w-1/3 bg-davinci-black-alt/80'
      style={{
        animation: 'indeterminate 1.5s infinite ease-in-out',
      }}
    />
  </ProgressPrimitive.Root>
))
IndeterminateProgress.displayName = 'IndeterminateProgress'

export { IndeterminateProgress }
