import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'label-mono inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground hover:bg-foreground hover:border-foreground',
        outline: 'border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
        subtle: 'border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground',
        ghost: 'border-transparent text-muted-foreground hover:text-foreground',
      },
      size: {
        default: 'h-10 px-5',
        sm: 'h-8 px-3',
        lg: 'h-12 px-7 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
