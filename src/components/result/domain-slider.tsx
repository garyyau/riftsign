import { DOMAIN_TEXT } from '@/components/domain-badge'
import { AXES, bandLabel, type Domain, type DomainAxisId } from '@/lib/axes'
import { cn } from '@/lib/utils'

interface DomainSliderProps {
  axis: DomainAxisId
  value: number
  shown: boolean
}

/** A Domain Axis (-5 to +5): the two Domain names at the ends and a marker between them. */
export function DomainSlider({ axis, value, shown }: DomainSliderProps) {
  const def = AXES[axis]
  const low = def.lowLabel as Domain
  const high = def.highLabel as Domain
  const pct = ((value - def.min) / (def.max - def.min)) * 100
  const signed = value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)
  return (
    <div className={cn('py-5 transition-opacity duration-500', shown ? 'opacity-100' : 'opacity-0')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-foreground">{bandLabel(axis, value)}</p>
        <p className="score-mono text-2xl">{signed}</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className={cn('label-mono w-12 shrink-0', DOMAIN_TEXT[low])}>{low}</span>
        <div className="relative h-1.5 flex-1 bg-border">
          <span aria-hidden className="absolute top-0 left-1/2 h-full w-px bg-background" />
          <span
            aria-hidden
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-primary bg-background transition-[left] duration-700 ease-out"
            style={{ left: shown ? `${pct}%` : '50%' }}
          />
        </div>
        <span className={cn('label-mono w-12 shrink-0 text-right', DOMAIN_TEXT[high])}>{high}</span>
      </div>
    </div>
  )
}
