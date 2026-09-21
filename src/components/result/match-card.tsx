import { DomainBadge } from '@/components/domain-badge'
import { Badge } from '@/components/ui/badge'
import { STRINGS } from '@/lib/strings'
import type { Match } from '@/lib/types'
import { CardImage } from './card-image'

export function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const { legend, fit } = match
  const s = STRINGS.result
  return (
    <article className="grid gap-6 border-t py-8 md:grid-cols-12">
      <div className="md:col-span-4 lg:col-span-3">
        <CardImage legend={legend} className="max-w-[260px]" />
      </div>
      <div className="min-w-0 md:col-span-8 lg:col-span-9">
        <p className="label-mono text-muted-foreground">
          <span className="text-primary">{String(rank).padStart(2, '0')}</span> / {s.fit(fit)}
        </p>
        <h3 className="display mt-3 text-3xl md:text-4xl">{legend.name}</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="strong">{legend.archetype}</Badge>
          {legend.domains.map((d) => (
            <DomainBadge key={d} domain={d} />
          ))}
          <Badge variant={legend.starterDeck ? 'primary' : 'default'}>
            {legend.starterDeck ? s.starter(legend.starterDeck) : s.noStarter}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-5 text-sm leading-relaxed sm:grid-cols-2">
          <div>
            <dt className="label-mono text-muted-foreground">{s.howItPlays}</dt>
            <dd className="mt-2">{legend.howItPlays}</dd>
          </div>
          <div>
            <dt className="label-mono text-muted-foreground">{s.whyYou}</dt>
            <dd className="mt-2">{legend.whyYou}</dd>
          </div>
        </dl>
        <a
          href={legend.deckListUrl}
          target="_blank"
          rel="noreferrer"
          className="label-mono mt-6 inline-block text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-primary"
        >
          {s.deckLists}
          <span aria-hidden className="ml-1">↗</span>
        </a>
      </div>
    </article>
  )
}
