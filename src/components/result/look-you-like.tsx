import { DomainTag } from '@/components/domain-tag'
import { Badge } from '@/components/ui/badge'
import { playstyleGaps } from '@/lib/scoring'
import { GAP_WORDS, STRINGS } from '@/lib/strings'
import type { Match, Profile } from '@/lib/types'
import { CardImage } from './card-image'

interface LookYouLikeProps {
  profile: Profile
  favouriteChampions: string[]
  /** The best-fitting Legend of those champions not already on the page, or null if all are shown. */
  pick: Match | null
}

/** Names at most this many playstyle gaps, biggest first, so the line stays readable. */
const MAX_GAPS = 2

/**
 * For a Player who named favourite champions: their best Legend that isn't already shown, with an
 * honest line on how its playstyle differs. Hidden when no champion was named.
 */
export function LookYouLike({ profile, favouriteChampions, pick }: LookYouLikeProps) {
  if (favouriteChampions.length === 0) return null
  const s = STRINGS.result
  const gaps = pick ? playstyleGaps(profile, pick.build).slice(0, MAX_GAPS) : []
  return (
    <section className="border-t py-8">
      <h2 className="display-m">{s.lookTitle}</h2>
      {pick ? (
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-3 lg:col-span-2">
            <CardImage legend={pick.legend} className="max-w-[160px]" />
          </div>
          <div className="min-w-0 md:col-span-9 lg:col-span-10">
            <p className="small-caps text-muted-foreground">{s.fit(pick.fit)}</p>
            <h3 className="display-s mt-3">{pick.legend.name}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge>{pick.build.archetype}</Badge>
              {pick.legend.domains.map((d) => (
                <DomainTag key={d} domain={d} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {s.lookLead(pick.legend.champion)}{' '}
              {gaps.length ? s.lookGaps(gaps.map((g) => GAP_WORDS[g.axis][g.gap > 0 ? 0 : 1])) : s.lookClose}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{s.lookCovered}</p>
      )}
    </section>
  )
}
