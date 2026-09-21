import { Check, Link2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AXIS_IDS, DOMAIN_AXIS_IDS, PLAYSTYLE_AXIS_IDS } from '@/lib/axes'
import { deriveArchetype, domainLean, rankLegends } from '@/lib/scoring'
import { ARCHETYPE_COPY, STRINGS } from '@/lib/strings'
import type { Legend, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AxisBar } from './axis-bar'
import { DomainLeanSection } from './domain-lean-section'
import { DomainSlider } from './domain-slider'
import { MatchCard } from './match-card'
import { RankingList } from './ranking-list'

export type ResultSource = 'fresh' | 'stored' | 'shared'

interface ResultViewProps {
  profile: Profile
  pool: Legend[]
  favouriteChampions: string[]
  source: ResultSource
  /** Shown when the stored or shared run used an older Question set. */
  versionChanged: boolean
  shareUrl: (topLegendId: string | null) => string
  onRetake: () => void
}

const REVEAL_STEP_MS = 380

export function ResultView({ profile, pool, favouriteChampions, source, versionChanged, shareUrl, onRetake }: ResultViewProps) {
  const s = STRINGS.result
  const matches = useMemo(() => rankLegends(profile, pool, { favouriteChampions }), [profile, pool, favouriteChampions])
  const archetype = deriveArchetype(matches)
  const top = matches.slice(0, 3)
  const lean = useMemo(() => domainLean(profile, pool, top.map((m) => m.legend)), [profile, pool, top])

  // First fresh view reveals one Axis at a time; returning and shared views skip straight to the summary.
  const [revealed, setRevealed] = useState(source === 'fresh' ? 0 : AXIS_IDS.length + 1)
  useEffect(() => {
    if (revealed > AXIS_IDS.length) return
    const t = window.setTimeout(() => setRevealed((n) => n + 1), REVEAL_STEP_MS)
    return () => window.clearTimeout(t)
  }, [revealed])
  const settled = revealed > AXIS_IDS.length

  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle')
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(top[0]?.legend.id ?? null))
      setCopied('done')
    } catch {
      setCopied('failed')
    }
    window.setTimeout(() => setCopied('idle'), 2500)
  }

  return (
    <div className="px-6">
      {source === 'shared' && (
        <Notice>
          {s.sharedNotice}{' '}
          <button type="button" onClick={onRetake} className="cursor-pointer underline underline-offset-4 hover:text-foreground">
            {s.takeOwn}
          </button>
        </Notice>
      )}
      {versionChanged && <Notice>{source === 'shared' ? s.olderLinkNotice : s.versionNotice}</Notice>}

      <section className="grid gap-10 py-12 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="label-mono text-muted-foreground">{s.eyebrow}</p>
          {archetype ? (
            <h1 className={cn('display mt-5 text-5xl transition-opacity duration-700 md:text-7xl', settled ? 'opacity-100' : 'opacity-0')}>
              <span className="block text-2xl text-muted-foreground md:text-3xl">{s.archetypeLead}</span>
              <span className="glow-primary text-primary">{ARCHETYPE_COPY[archetype].name}</span>
            </h1>
          ) : (
            <h1 className="display mt-5 text-4xl md:text-5xl">{s.scoresTitle}</h1>
          )}
          <p className={cn('mt-6 max-w-md text-base leading-relaxed text-muted-foreground transition-opacity duration-700', settled ? 'opacity-100' : 'opacity-0')}>
            {archetype ? ARCHETYPE_COPY[archetype].description : s.noPool}
          </p>
          <div className={cn('mt-8 flex flex-wrap gap-3 transition-opacity duration-700', settled ? 'opacity-100' : 'opacity-0')}>
            {source !== 'shared' && (
              <Button onClick={copyLink}>
                {copied === 'done' ? <Check aria-hidden /> : <Link2 aria-hidden />}
                {copied === 'done' ? s.shared : copied === 'failed' ? s.shareFailed : s.share}
              </Button>
            )}
            <Button variant="subtle" onClick={onRetake}>
              {source === 'shared' ? s.takeOwn : s.retake}
            </Button>
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
          <div className="divide-y">
            {PLAYSTYLE_AXIS_IDS.map((axis, i) => (
              <AxisBar key={axis} axis={axis} value={profile[axis]} shown={revealed > i} />
            ))}
            {DOMAIN_AXIS_IDS.map((axis, i) => (
              <DomainSlider key={axis} axis={axis} value={profile[axis]} shown={revealed > PLAYSTYLE_AXIS_IDS.length + i} />
            ))}
          </div>
        </div>
      </section>

      {matches.length > 0 && (
        <section className={cn('transition-opacity duration-700', settled ? 'opacity-100 rise-in' : 'opacity-0')}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-t pt-8 pb-2">
            <h2 className="display text-3xl">{s.matchesTitle}</h2>
            <p className="label-mono text-muted-foreground">{s.fitNote}</p>
          </div>
          {top.map((m, i) => (
            <MatchCard key={m.legend.id} match={m} rank={i + 1} />
          ))}
          <RankingList matches={matches} />
          <DomainLeanSection lean={lean} />
        </section>
      )}
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 rounded-md border border-warning/60 px-4 py-3 text-sm text-muted-foreground">{children}</p>
}
