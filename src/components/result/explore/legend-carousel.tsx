import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef } from 'react'
import type { RankedMatch } from '@/lib/explore'
import { STRINGS } from '@/lib/strings'
import type { Legend } from '@/lib/types'
import { cn } from '@/lib/utils'

interface LegendCarouselProps {
  items: RankedMatch[]
  /** Every Legend in the pool, to tell apart champions with more than one Legend. */
  legends: Legend[]
  selectedId: string | undefined
  /** Ranks in amber: the Legends already shown higher on the page. */
  shownIds: string[]
  onSelect: (id: string) => void
}

/** Full-bleed strip of ranked Legend portraits, scrollable by touch, trackpad or the arrow buttons. */
export function LegendCarousel({ items, legends, selectedId, shownIds, onSelect }: LegendCarouselProps) {
  const s = STRINGS.explore
  const strip = useRef<HTMLDivElement>(null)
  const repeated = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of legends) counts.set(l.champion, (counts.get(l.champion) ?? 0) + 1)
    return new Set([...counts].filter(([, n]) => n > 1).map(([champion]) => champion))
  }, [legends])

  const page = (direction: 1 | -1) => {
    const el = strip.current
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative mx-[calc(50%_-_50vw)] w-screen">
      <div
        ref={strip}
        className={cn(
          'flex snap-x snap-mandatory gap-5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Lines the first portrait up with the 1200px content column while the strip runs to the viewport edges.
          'px-[max(1.5rem,calc(50vw_-_600px))] scroll-px-[max(1.5rem,calc(50vw_-_600px))]',
          '[mask-image:linear-gradient(to_right,transparent,#000_min(200px,12%),#000_calc(100%_-_min(200px,12%)),transparent)]',
        )}
      >
        {items.map(({ match: { legend }, rank }) => {
          const selected = legend.id === selectedId
          const subtitle = repeated.has(legend.champion) ? legend.name.slice(legend.champion.length).replace(/^,\s*/, '') : null
          return (
            <button
              key={legend.id}
              type="button"
              aria-pressed={selected}
              aria-label={s.portraitLabel(rank, legend.name)}
              title={legend.name}
              onClick={(e) => {
                onSelect(legend.id)
                e.currentTarget.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
              }}
              className="group w-24 shrink-0 cursor-pointer snap-start rounded-md text-center outline-none"
            >
              <span
                className={cn(
                  'relative block size-24 overflow-hidden rounded-md border bg-panel transition-colors group-hover:border-border-strong group-focus-visible:ring-2 group-focus-visible:ring-ring',
                  selected && 'border-primary ring-1 ring-primary group-hover:border-primary',
                )}
              >
                <img
                  src={`${import.meta.env.BASE_URL}portraits/${legend.id}.webp`}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
                <span
                  className={cn(
                    'absolute top-1.5 left-1.5 min-w-[30px] rounded-[3px] bg-background/85 px-1 text-[11px] leading-5 font-semibold',
                    shownIds.includes(legend.id) ? 'text-amber' : 'text-secondary-text',
                  )}
                >
                  {s.rank(rank)}
                </span>
              </span>
              <span
                className={cn(
                  'mt-2 block truncate text-[13px] leading-4',
                  selected ? 'font-semibold text-foreground' : 'font-medium text-secondary-text',
                )}
              >
                {legend.champion}
              </span>
              {subtitle && <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">{subtitle}</span>}
            </button>
          )
        })}
      </div>
      <ArrowButton side="left" label={s.scrollBack} onClick={() => page(-1)} />
      <ArrowButton side="right" label={s.scrollForward} onClick={() => page(1)} />
    </div>
  )
}

function ArrowButton({ side, label, onClick }: { side: 'left' | 'right'; label: string; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'absolute top-[30px] hidden size-11 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-foreground transition-colors outline-none hover:border-faint hover:bg-rule focus-visible:ring-2 focus-visible:ring-ring sm:flex',
        side === 'left' ? 'left-12' : 'right-12',
      )}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  )
}
