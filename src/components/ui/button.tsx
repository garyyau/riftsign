import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

// Labels may wrap: the button grows in height, the text stays left-aligned and the chevron stays right.
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-md text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-track disabled:text-faint',
        secondary:
          'border border-border-strong bg-surface font-medium text-foreground hover:border-faint hover:bg-rule disabled:border-border-strong disabled:bg-surface disabled:text-faint',
        link: 'font-medium text-muted-foreground hover:text-foreground disabled:text-dim',
      },
      size: {
        lg: 'min-h-12 px-6 py-3 text-button',
        md: 'min-h-10 px-5 py-2 text-button-md',
        sm: 'min-h-8 px-4 py-1.5 text-button-sm',
      },
    },
    // A text link sits in the text flow: no padding or minimum height.
    compoundVariants: [{ variant: 'link', className: 'min-h-0 px-0 py-0 text-button-md' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

/** The single chevron that marks a forward action (Start the test, Next, Show my Legends). */
function ForwardChevron() {
  return (
    <svg viewBox="0 0 8 14" fill="none" aria-hidden className="h-3.5 w-2">
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Button({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  forward = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Adds the forward chevron after the label. Only forward actions carry it. */
    forward?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {forward && <ForwardChevron />}
    </Comp>
  )
}

export { Button, buttonVariants }
