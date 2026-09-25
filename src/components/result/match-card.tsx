import { DomainTag } from '@/components/domain-tag'
import { Badge } from '@/components/ui/badge'
import { reviewedBuilds } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Match } from '@/lib/types'
import { stepNumber } from '@/lib/utils'
import { CardImage } from './card-image'

export function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const { legend, build, fit } = match
  const s = STRINGS.result
  const otherArchetypes = reviewedBuilds(legend)
    .filter((b) => b !== build)
    .map((b) => b.archetype)
  return (
    <article className="grid gap-6 border-t py-8 md:grid-cols-12">
      <div className="md:col-span-4 lg:col-span-3">
        <CardImage legend={legend} className="max-w-[260px]" />
      </div>
      <div className="min-w-0 md:col-span-8 lg:col-span-9">
        <p className="eyebrow">
          <span className="text-primary">{stepNumber(rank)}</span> / {s.fit(fit)}
        </p>
        <h3 className="display-m md:display-l mt-3">{legend.name}</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge>{build.archetype}</Badge>
          {legend.domains.map((d) => (
            <DomainTag key={d} domain={d} />
          ))}
          <Badge variant={legend.starterDeck ? 'starter' : 'default'}>
            {legend.starterDeck ? s.starter(legend.starterDeck) : s.noStarter}
          </Badge>
        </div>
        {otherArchetypes.length > 0 && (
          <p className="mt-3 text-small text-muted-foreground">{s.alsoPlayed(otherArchetypes)}</p>
        )}
        <dl className="mt-6 grid gap-5 text-body text-secondary-text sm:grid-cols-2">
          <div>
            <dt className="small-caps text-muted-foreground">{s.howItPlays}</dt>
            <dd className="mt-2">{build.howItPlays}</dd>
          </div>
          <div>
            <dt className="small-caps text-muted-foreground">{s.whyYou}</dt>
            <dd className="mt-2">{build.whyYou}</dd>
          </div>
        </dl>
        <a
          href={build.deckListUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-small font-medium text-primary underline-offset-4 hover:underline"
        >
          {s.deckLists}
          <span aria-hidden className="ml-1">↗</span>
        </a>
      </div>
    </article>
  )
}
