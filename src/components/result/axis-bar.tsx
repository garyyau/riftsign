import { AXES, bandLabel, normalize, SCORE_MAX, type PlaystyleAxisId } from '@/lib/axes'
import { cn } from '@/lib/utils'

interface AxisBarProps {
  axis: PlaystyleAxisId
  value: number
  /** Grow the fill in from zero, for a fresh result. Reduced motion makes it instant. */
  animate: boolean
}

/** A playstyle Axis (0-10): its band label, the score, and a bar split into the five bands. */
export function AxisBar({ axis, value, animate }: AxisBarProps) {
  const def = AXES[axis]
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="small-caps text-muted-foreground">{def.name}</p>
          <p className="mt-1.5 text-body leading-tight font-medium text-foreground first-letter:uppercase">{bandLabel(axis, value)}</p>
        </div>
        <p className="score mt-2.5 shrink-0">
          {value.toFixed(1)}
          <span className="ml-2.5 font-sans text-small text-muted-foreground">/ {SCORE_MAX}</span>
        </p>
      </div>
      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div
          className={cn('h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-out', animate && 'starting:scale-x-0')}
          style={{ width: `${normalize(value) * 100}%` }}
        />
        {[20, 40, 60, 80].map((tick) => (
          <span key={tick} aria-hidden className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-background" style={{ left: `${tick}%` }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{def.lowLabel}</span>
        <span>{def.highLabel}</span>
      </div>
    </div>
  )
}
