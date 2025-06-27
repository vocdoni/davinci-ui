'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '~lib/utils'

const linkVariants = cva(
  // BASE
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // SENSE UNDERLINE per defecte, només hover
        default: 'text-primary hover:text-primary/80 hover:underline hover:underline-offset-4',
        subtle: 'text-muted-foreground hover:text-primary hover:underline hover:underline-offset-4',
      },
      size: {
        default: 'text-md',
        sm: 'text-xs',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  asChild?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a'

    return <Comp ref={ref} className={cn(linkVariants({ variant, size, className }))} {...props} />
  }
)
Link.displayName = 'Link'

export { Link, linkVariants }
