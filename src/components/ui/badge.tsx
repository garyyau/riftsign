import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'label-mono inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm border px-2 py-1.5 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-border text-muted-foreground',
        strong: 'border-foreground text-foreground',
        primary: 'border-primary text-primary',
        warning: 'border-warning text-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
