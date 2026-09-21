import type { Domain } from '@/lib/axes'
import { cn } from '@/lib/utils'

const DOT: Record<Domain, string> = {
  Fury: 'bg-domain-fury',
  Calm: 'bg-domain-calm',
  Mind: 'bg-domain-mind',
  Body: 'bg-domain-body',
  Chaos: 'bg-domain-chaos',
  Order: 'bg-domain-order',
}

export const DOMAIN_TEXT: Record<Domain, string> = {
  Fury: 'text-domain-fury',
  Calm: 'text-domain-calm',
  Mind: 'text-domain-mind',
  Body: 'text-domain-body',
  Chaos: 'text-domain-chaos',
  Order: 'text-domain-order',
}

/** Domain colour appears only as a small dot beside the name, never as a background. */
export function DomainBadge({ domain, className }: { domain: Domain; className?: string }) {
  return (
    <span className={cn('label-mono inline-flex items-center gap-1.5 text-muted-foreground', className)}>
      <span aria-hidden className={cn('size-1.5 rounded-full', DOT[domain])} />
      {domain}
    </span>
  )
}
