import { ChevronDown, Search } from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'
import { defaultExploreId, exploreStrip, type ExploreSort } from '@/lib/explore'
import { STRINGS } from '@/lib/strings'
import type { Match, Profile } from '@/lib/types'
import { LegendCarousel } from './explore/legend-carousel'
import { LegendPanel } from './explore/legend-panel'

export interface ExploreSectionProps {
  /** Every Legend ranked for the Profile, best fit first (rankLegends output). */
  matches: Match[]
  profile: Profile
  /** Viewing someone else's result: "you" copy becomes "them". */
  shared: boolean
  /** Legend ids already shown higher on the page; the panel starts on the best-ranked Legend not in this list. */
  shownIds: string[]
}

const field = 'h-11 w-full rounded-md border bg-surface text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Every Legend in fit order: a searchable portrait carousel and a panel comparing the picked Legend with the Player. */
export function ExploreSection({ matches, profile, shared, shownIds }: ExploreSectionProps): JSX.Element {
  const s = STRINGS.explore
  const [sort, setSort] = useState<ExploreSort>('fit')
  const [query, setQuery] = useState('')
  const [pickedId, setPickedId] = useState<string>()
  const legends = useMemo(() => matches.map((m) => m.legend), [matches])
  const items = useMemo(() => exploreStrip(matches, sort, query), [matches, sort, query])

  const selectedId = pickedId ?? defaultExploreId(matches, shownIds)
  const index = matches.findIndex((m) => m.legend.id === selectedId)
  const selected = matches[index]

  return (
    <section id="explore" aria-labelledby="explore-title" className="scroll-mt-8 py-16 md:py-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[700px]">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="explore-title" className="display-m mt-3.5">
            {s.title}
          </h2>
          <p className="mt-3.5 text-body text-secondary-text">{shared ? s.sharedLead : s.lead}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:pt-6">
          <div className="relative sm:w-[180px]">
            <select
              aria-label={s.sortLabel}
              value={sort}
              onChange={(e) => setSort(e.target.value === 'name' ? 'name' : 'fit')}
              className={`${field} cursor-pointer appearance-none pr-10 pl-4 font-medium`}
            >
              <option value="fit">{s.sortFit}</option>
              <option value="name">{s.sortName}</option>
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-foreground" />
          </div>
          <div className="relative sm:w-[260px]">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label={s.searchPlaceholder(matches.length)}
              placeholder={s.searchPlaceholder(matches.length)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${field} pr-4 pl-10 placeholder:text-faint`}
            />
          </div>
        </div>
      </div>

      <div className="mt-7">
        {items.length ? (
          <LegendCarousel items={items} legends={legends} selectedId={selectedId} shownIds={shownIds} onSelect={setPickedId} />
        ) : (
          <p className="py-10 text-center text-body text-muted-foreground">{s.noResults(query.trim())}</p>
        )}
      </div>

      {selected && (
        <div className="mt-10">
          <LegendPanel
            key={selected.legend.id}
            match={selected}
            rank={index + 1}
            total={matches.length}
            profile={profile}
            pool={legends}
            shared={shared}
          />
        </div>
      )}
    </section>
  )
}
