import { Fragment, useEffect, useRef, useState } from 'react'
import { DomainTag } from '@/components/domain-tag'
import { Button } from '@/components/ui/button'
import { DOMAIN_ID } from '@/lib/axes'
import { buildFit, reviewedBuilds } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Build, Legend, Match, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CardImage } from './card-image'
import { DeckListBox } from './deck-list-box'
import { PlayedAs } from './played-as'

interface ResultHeroProps {
  /** The top Match, or null when no Legend has been reviewed yet. */
  top: Match | null
  profile: Profile
  pool: Legend[]
  shared: boolean
  shareLink: () => string
  onRetake: () => void
}

const COPIED_RESET_MS = 2500

/**
 * The top Match's card and its best-fit Build. "Also played as" swaps the hero to the Legend's other
 * Builds and back; the share link always names the top Match.
 */
export function ResultHero({ top, profile, pool, shared, shareLink, onRetake }: ResultHeroProps) {
  const s = STRINGS.result
  const [picked, setPicked] = useState<Build | null>(null)

  if (!top) {
    return (
      <section className="py-12 md:py-16">
        <h1 className="display-l">{s.scoresTitle}</h1>
        <p className="mt-6 max-w-xl text-body text-secondary-text">{s.noPool}</p>
        <Actions shared={shared} shareLink={shareLink} onRetake={onRetake} className="mt-8" />
      </section>
    )
  }

  const { legend } = top
  const builds = reviewedBuilds(legend)
  // A pick from an earlier top Legend isn't among this one's Builds, so the hero falls back to the best fit.
  const shown = picked && builds.includes(picked) ? picked : top.build
  const isBest = shown === top.build
  const fit = isBest ? top.fit : buildFit(profile, pool, legend, shown)
  const others = builds.filter((b) => b !== shown)
  const [first, second] = legend.domains
  const glow = (domain: string, x: number) => `${x}px 0 60px color-mix(in srgb, var(--domain-${domain}) 35%, transparent)`

  return (
    <section className="grid gap-8 pt-10 pb-12 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-12 md:pt-12 md:pb-16 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-20">
      <div
        className="w-full max-w-60 self-start rounded-[14px] md:max-w-none"
        style={{ boxShadow: `${glow(DOMAIN_ID[first], -24)}, ${glow(DOMAIN_ID[second], 24)}` }}
      >
        <CardImage legend={legend} className="rounded-[14px] border-0" />
      </div>
      <div className="min-w-0 md:pt-5">
        <p className="eyebrow">
          <span>{isBest ? (shared ? s.sharedTopBuild : s.topBuild) : s.otherBuild}</span>
          <span className="mx-3">/</span>
          <span>{s.fit(fit)}</span>
        </p>
        <h1 className="display-m md:display-l mt-2.5">{legend.name}</h1>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {legend.domains.map((d) => (
            <DomainTag key={d} domain={d} />
          ))}
        </div>
        <PlayedAs archetype={shown.archetype} className="mt-4 text-body-l" />
        <div className="max-w-[640px]">
          <p className="mt-5 text-body text-muted-foreground">{shown.whyYou}</p>
          <DeckListBox legend={legend} build={shown} className="mt-6" />
          {others.length > 0 && (
            <p className="mt-3 rounded-md border border-dashed px-5 py-4 text-[15px] text-muted-foreground">
              {s.alsoPlayed}{' '}
              {others.map((build, i) => (
                <Fragment key={build.archetype}>
                  {i > 0 && ` ${s.and} `}
                  <button
                    type="button"
                    onClick={() => setPicked(build)}
                    className="cursor-pointer rounded-sm font-semibold text-primary underline underline-offset-3 outline-none hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {build.archetype}
                  </button>
                  {build === top.build && ` ${shared ? s.sharedBestFit : s.bestFit}`}
                </Fragment>
              ))}
            </p>
          )}
        </div>
        <Actions shared={shared} shareLink={shareLink} onRetake={onRetake} className="mt-8" />
        <p className="mt-4 text-[13px] text-faint">{s.fitNote}</p>
      </div>
    </section>
  )
}

function Actions({ shared, shareLink, onRetake, className }: Pick<ResultHeroProps, 'shared' | 'shareLink' | 'onRetake'> & { className?: string }) {
  const s = STRINGS.result
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle')
  const copiedTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(copiedTimer.current), [])
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink())
      setCopied('done')
    } catch {
      setCopied('failed')
    }
    window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied('idle'), COPIED_RESET_MS)
  }
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {!shared && (
        <Button size="lg" onClick={copyLink}>
          {copied === 'done' ? s.shared : copied === 'failed' ? s.shareFailed : s.share}
        </Button>
      )}
      <Button size="lg" variant="secondary" onClick={onRetake}>
        {shared ? s.takeOwn : s.retake}
      </Button>
    </div>
  )
}
