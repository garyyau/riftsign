import { DomainBadge } from '@/components/domain-badge'
import { normalize, SCORE_MAX, type Domain } from '@/lib/axes'
import { domainFeeling } from '@/lib/scoring'
import { DOMAIN_COPY, STRINGS } from '@/lib/strings'
import { cn } from '@/lib/utils'

interface DomainBarProps {
  domain: Domain
  value: number
  /** One of the Domains that clearly lead the Profile. */
  highlighted: boolean
}

/** One Domain score (0-10, 5 neutral): the feeling it counts as, the score, and a bar with a tick at neutral. */
export function DomainBar({ domain, value, highlighted }: DomainBarProps) {
  return (
    <li className="py-4" data-highlighted={highlighted || undefined}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <DomainBadge domain={domain} className={highlighted ? 'text-foreground' : undefined} />
          <p className={cn('mt-1.5 text-sm', highlighted ? 'text-primary' : 'text-foreground')}>
            {STRINGS.result.domainFeeling[domainFeeling(value)]}
          </p>
        </div>
        <p className="score-mono text-xl">
          {value.toFixed(1)}
          <span className="text-muted-foreground"> / {SCORE_MAX}</span>
        </p>
      </div>
      <div className="relative mt-3 h-1.5 w-full bg-border">
        <div className={cn('h-full', highlighted ? 'bg-primary' : 'bg-muted-foreground')} style={{ width: `${normalize(value) * 100}%` }} />
        <span aria-hidden className="absolute top-0 left-1/2 h-full w-px bg-background" />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{DOMAIN_COPY[domain]}</p>
    </li>
  )
}
