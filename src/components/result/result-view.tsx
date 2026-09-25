import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { PLAYSTYLE_AXIS_IDS } from '@/lib/axes'
import { domainPicks, rankLegends } from '@/lib/scoring'
import { shareLegendId } from '@/lib/share'
import { STRINGS } from '@/lib/strings'
import type { Legend, Profile } from '@/lib/types'
import { AlsoPlaysLikeYou } from './also-plays-like-you'
import { AxisBar } from './axis-bar'
import { ExploreSection } from './explore-section'
import { ResultBanner } from './result-banner'
import { ResultHero } from './result-hero'
import { YourDomainsSection } from './your-domains-section'

export type ResultSource = 'fresh' | 'stored' | 'shared'

interface ResultViewProps {
  profile: Profile
  pool: Legend[]
  source: ResultSource
  /** Shown when the stored or shared run used an older Question set. */
  versionChanged: boolean
  shareUrl: (topLegendId: string | null) => string
  onRetake: () => void
}

export function ResultView({ profile, pool, source, versionChanged, shareUrl, onRetake }: ResultViewProps) {
  const s = STRINGS.result
  const shared = source === 'shared'
  const matches = useMemo(() => rankLegends(profile, pool), [profile, pool])
  const [top = null, second] = matches
  const picks = useMemo(() => domainPicks(profile, matches), [profile, matches])
  const shareLegend = useMemo(() => shareLegendId(profile, pool), [profile, pool])
  const shownIds = [top, second, ...picks.matches].flatMap((m) => (m ? [m.legend.id] : []))

  return (
    <div className="px-6">
      {shared && (
        <ResultBanner
          action={
            <Button variant="secondary" size="sm" onClick={onRetake}>
              {s.takeOwn}
            </Button>
          }
        >
          {s.sharedNotice}
        </ResultBanner>
      )}
      {versionChanged && <ResultBanner>{shared ? s.olderLinkNotice : s.versionNotice}</ResultBanner>}

      <ResultHero top={top} profile={profile} pool={pool} shared={shared} shareLink={() => shareUrl(shareLegend)} onRetake={onRetake} />

      <div className="grid gap-12 border-t border-rule py-12 md:grid-cols-2 md:gap-16 md:py-16 lg:gap-30">
        {second && <AlsoPlaysLikeYou match={second} shared={shared} />}
        <section>
          <h2 className="eyebrow">{shared ? s.sharedPlaystyleTitle : s.playstyleTitle}</h2>
          <div className="mt-6 flex flex-col gap-6">
            {PLAYSTYLE_AXIS_IDS.map((axis) => (
              <AxisBar key={axis} axis={axis} value={profile[axis]} animate={source === 'fresh'} />
            ))}
          </div>
        </section>
      </div>

      <YourDomainsSection profile={profile} picks={picks} shared={shared} legendCount={matches.length} />

      {matches.length > 0 && <ExploreSection matches={matches} profile={profile} shared={shared} shownIds={shownIds} />}
    </div>
  )
}
