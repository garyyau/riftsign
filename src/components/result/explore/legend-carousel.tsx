import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RankedMatch } from '@/lib/explore'
import { STRINGS } from '@/lib/strings'
import type { Legend } from '@/lib/types'
import { cn } from '@/lib/utils'

const fade = '96px'

interface LegendCarouselProps {
  items: RankedMatch[]
  /** Every Legend in the pool, to tell apart champions with more than one Legend. */
  legends: Legend[]
  selectedId: string | undefined
  /** Ranks in amber: the Legends already shown higher on the page. */
  shownIds: string[]
  onSelect: (id: string) => void
}

/** Strip of ranked Legend portraits within the content column, scrollable by touch, trackpad or the arrow buttons. */
export function LegendCarousel({ items, legends, selectedId, shownIds, onSelect }: LegendCarouselProps) {
  const s = STRINGS.explore
  const strip = useRef<HTMLDivElement>(null)
  const repeated = useMemo(() => {
    const counts = new Map<string, number>()
    for (const l of legends) counts.set(l.champion, (counts.get(l.champion) ?? 0) + 1)
    return new Set([...counts].filter(([, n]) => n > 1).map(([champion]) => champion))
  }, [legends])

  // Which ends still have Legends out of view; only those edges fade.
  const [more, setMore] = useState({ back: false, forward: false })
  const measure = () => {
    const el = strip.current
    if (el) setMore({ back: el.scrollLeft > 1, forward: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 })
  }
  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items])

  const page = (direction: 1 | -1) => {
    const el = strip.current
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={strip}
        onScroll={measure}
        style={{
          maskImage: `linear-gradient(to right, transparent, #000 ${more.back ? fade : '0px'}, #000 calc(100% - ${more.forward ? fade : '0px'}), transparent)`,
        }}
        className={cn(
          // items-start keeps portraits top-aligned when some Legends carry a subtitle line.
          'flex snap-x snap-mandatory items-start gap-5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Room for the focus ring without shifting the first portrait off the column edge.
          '-mx-1 scroll-px-1 px-1',
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
        side === 'left' ? 'left-0' : 'right-0',
      )}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  )
}
