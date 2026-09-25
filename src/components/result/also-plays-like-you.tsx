import { DomainTag } from '@/components/domain-tag'
import { Badge } from '@/components/ui/badge'
import { STRINGS } from '@/lib/strings'
import type { Match } from '@/lib/types'
import { stepNumber } from '@/lib/utils'
import { CardImage } from './card-image'
import { DeckListBox } from './deck-list-box'
import { PlayedAs } from './played-as'

/** The #2 Match: a Legend that also plays like the Player, told through "How it plays". */
export function AlsoPlaysLikeYou({ match, shared }: { match: Match; shared: boolean }) {
  const { legend, build, fit } = match
  const s = STRINGS.result
  return (
    <section>
      <h2 className="eyebrow">{shared ? s.sharedAlsoPlaysTitle : s.alsoPlaysTitle}</h2>
      <div className="mt-6 grid grid-cols-[88px_minmax(0,1fr)] gap-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-8">
        <CardImage legend={legend} className="rounded-lg" />
        <div>
          <p className="small-caps text-muted-foreground">
            {stepNumber(2)} <span className="mx-1.5">/</span> {s.fit(fit)}
          </p>
          <h3 className="display-s mt-2.5">{legend.name}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {legend.domains.map((d) => (
              <DomainTag key={d} domain={d} />
            ))}
          </div>
          <PlayedAs archetype={build.archetype} className="mt-3" />
          {legend.starterDeck && (
            <Badge variant="starter" className="mt-3.5 whitespace-normal">
              {s.starter(legend.starterDeck)}
            </Badge>
          )}
          <p className="small-caps mt-5 text-muted-foreground">{s.howItPlays}</p>
          <p className="mt-2 text-body text-secondary-text">{build.howItPlays}</p>
          <DeckListBox legend={legend} build={build} className="mt-6" />
        </div>
      </div>
    </section>
  )
}
