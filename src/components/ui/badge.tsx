import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/** Tags: uppercase tag text on a dark tint. Domain tags live in `DomainTag`. */
const badgeVariants = cva('tag-text inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 whitespace-nowrap', {
  variants: {
    variant: {
      /** Archetypes and other neutral facts. */
      default: 'bg-secondary-text/10 text-foreground',
      starter: 'bg-primary/12 text-primary',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
