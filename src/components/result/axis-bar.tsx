import { AXES, bandLabel, normalize, SCORE_MAX, type PlaystyleAxisId } from '@/lib/axes'
import { cn } from '@/lib/utils'

interface AxisBarProps {
  axis: PlaystyleAxisId
  value: number
  /** When false the bar sits at zero width; flips to true during the reveal. */
  shown: boolean
}

/** A playstyle Axis (0-10): horizontal bar with five band ticks, the score, and its band label. */
export function AxisBar({ axis, value, shown }: AxisBarProps) {
  const def = AXES[axis]
  const pct = normalize(value) * 100
  return (
    <div className={cn('py-5 transition-opacity duration-500', shown ? 'opacity-100' : 'opacity-0')}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="small-caps text-muted-foreground">{def.name}</p>
          <p className="mt-1.5 text-sm text-foreground">{bandLabel(axis, value)}</p>
        </div>
        <p className="score">
          {value.toFixed(1)}
          <span className="font-sans text-small text-muted-foreground"> / {SCORE_MAX}</span>
        </p>
      </div>
      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: shown ? `${pct}%` : '0%' }}
        />
        {[20, 40, 60, 80].map((tick) => (
          <span key={tick} aria-hidden className="absolute top-0 h-full w-px bg-background" style={{ left: `${tick}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{def.lowLabel}</span>
        <span>{def.highLabel}</span>
      </div>
    </div>
  )
}
