import { useMemo, useState } from 'react'
import { DomainTag } from '@/components/domain-tag'
import { buildFits } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Legend, Match, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CardImage } from '../card-image'
import { DeckListBox } from '../deck-list-box'
import { CompareWithPlayer } from './compare-with-player'

interface LegendPanelProps {
  match: Match
  rank: number
  total: number
  profile: Profile
  pool: Legend[]
  shared: boolean
}

/** The Legend picked in the carousel. Remount per Legend (key it by id) so the Build picker resets. */
export function LegendPanel({ match, rank, total, profile, pool, shared }: LegendPanelProps) {
  const s = STRINGS.explore
  const { legend } = match
  const fits = useMemo(() => buildFits(profile, pool, legend), [profile, legend, pool])
  const [build, setBuild] = useState(match.build)
  const fit = fits.find((f) => f.build === build)?.fit ?? match.fit

  return (
    <article className="grid gap-8 rounded-lg border bg-panel p-6 md:grid-cols-[200px_minmax(0,1fr)] md:p-8 lg:grid-cols-[200px_minmax(0,392fr)_minmax(0,452fr)]">
      <CardImage legend={legend} className="max-w-[200px]" />
      <div className="flex min-w-0 flex-col">
        <p className="small-caps text-muted-foreground">{s.rankOf(rank, total, fit)}</p>
        <h3 className="display-s mt-2.5">{legend.name}</h3>
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {legend.domains.map((d) => (
            <DomainTag key={d} domain={d} />
          ))}
        </div>
        {fits.length > 1 && (
          <div role="radiogroup" aria-label={s.buildsLabel} className="mt-5 grid gap-2">
            {fits.map((f) => {
              const checked = f.build === build
              return (
                <label
                  key={f.build.archetype}
                  className={cn(
                    'flex h-12 cursor-pointer items-center gap-3 rounded-md border px-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                    checked ? 'border-primary bg-selected' : 'bg-surface hover:border-border-strong',
                  )}
                >
                  <input
                    type="radio"
                    name={`explore-build-${legend.id}`}
                    checked={checked}
                    onChange={() => setBuild(f.build)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                      checked ? 'border-primary' : 'border-faint',
                    )}
                  >
                    {checked && <span className="size-[7px] rounded-full bg-primary" />}
                  </span>
                  <span className={cn('flex-1 text-[15px] font-semibold', checked ? 'text-foreground' : 'text-secondary-text')}>
                    {f.build.archetype}
                  </span>
                  <span className={cn('text-sm font-semibold', checked ? 'text-amber' : 'text-muted-foreground')}>{s.fit(f.fit)}</span>
                </label>
              )
            })}
          </div>
        )}
        <p className="mt-3.5 text-body text-muted-foreground">
          {s.playedAs} <span className="font-semibold text-primary">{build.archetype}</span>
        </p>
        <p className="mt-4 text-small text-secondary-text">{build.howItPlays}</p>
        <DeckListBox legend={legend} build={build} className="mt-8 bg-surface" />
      </div>
      <div className="min-w-0 md:col-span-2 lg:col-span-1 lg:pl-7">
        <CompareWithPlayer profile={profile} legend={legend} build={build} shared={shared} />
      </div>
    </article>
  )
}
