import { badgeVariants } from '@/components/ui/badge'
import type { Domain } from '@/lib/axes'
import { cn } from '@/lib/utils'

const TINT: Record<Domain, string> = {
  Fury: 'bg-domain-fury/18 text-domain-fury',
  Calm: 'bg-domain-calm/18 text-domain-calm',
  Mind: 'bg-domain-mind/18 text-domain-mind',
  Body: 'bg-domain-body/18 text-domain-body',
  Chaos: 'bg-domain-chaos/18 text-domain-chaos',
  Order: 'bg-domain-order/18 text-domain-order',
}

/** A Domain tag in its Domain colour. `quiet` greys it out, as on a Domain bar that doesn't lead. */
export function DomainTag({ domain, quiet = false, className }: { domain: Domain; quiet?: boolean; className?: string }) {
  return <span className={cn(badgeVariants(), quiet ? 'bg-muted-foreground/12 text-muted-foreground' : TINT[domain], className)}>{domain}</span>
}
