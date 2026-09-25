import { DomainTag } from '@/components/domain-tag'
import { normalize, SCORE_MAX, type Domain } from '@/lib/axes'
import { domainFeeling } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { cn } from '@/lib/utils'

interface DomainBarProps {
  domain: Domain
  value: number
  /** One of the Domains that clearly lead the Profile. */
  highlighted: boolean
}

/** A leading Domain's bar fill. */
const DOMAIN_FILL: Record<Domain, string> = {
  Fury: 'bg-domain-fury',
  Calm: 'bg-domain-calm',
  Mind: 'bg-domain-mind',
  Body: 'bg-domain-body',
  Chaos: 'bg-domain-chaos',
  Order: 'bg-domain-order',
}

/** One Domain score (0-10, 5 neutral): the feeling it counts as, the score, and a bar with a tick at neutral. */
export function DomainBar({ domain, value, highlighted }: DomainBarProps) {
  return (
    <li data-highlighted={highlighted || undefined}>
      <div className="flex items-center gap-3">
        <DomainTag domain={domain} quiet={!highlighted} />
        <p className={cn('min-w-0 flex-1 text-body', highlighted ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
          {STRINGS.result.domainFeeling[domainFeeling(value)]}
        </p>
        <p className={cn('shrink-0 font-display text-lg tabular-nums', highlighted ? 'text-foreground' : 'text-secondary-text')}>
          {value.toFixed(1)}
          <span className="ml-2.5 font-sans text-xs text-muted-foreground">/ {SCORE_MAX}</span>
        </p>
      </div>
      <div className="relative mt-3.5 h-1.5 w-full rounded-full bg-track">
        <div className={cn('h-full rounded-full', highlighted ? DOMAIN_FILL[domain] : 'bg-faint')} style={{ width: `${normalize(value) * 100}%` }} />
        <span aria-hidden className="absolute top-1/2 left-1/2 h-3.5 w-0.5 -translate-1/2 bg-muted-foreground" />
      </div>
    </li>
  )
}
