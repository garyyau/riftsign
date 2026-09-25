import type { CSSProperties } from 'react'
import { AXES, normalize, PLAYSTYLE_AXIS_IDS } from '@/lib/axes'
import { axisGapLabel, gapSummary } from '@/lib/explore'
import { STRINGS } from '@/lib/strings'
import type { Build, Legend, Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Filled cyan for the Player, hollow amber for the Build. */
function Diamond({ player, className, style }: { player: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden className={cn('size-3.5 shrink-0', className)} style={style}>
      <path
        d="M7 1.5 12.5 7 7 12.5 1.5 7Z"
        strokeWidth={2}
        strokeLinejoin="round"
        className={player ? 'fill-primary stroke-primary' : 'fill-background stroke-amber'}
      />
    </svg>
  )
}

interface CompareWithPlayerProps {
  profile: Profile
  legend: Legend
  build: Build
  shared: boolean
}

/** Where the Build sits against the Player on each playstyle Axis, with a one-line summary. */
export function CompareWithPlayer({ profile, legend, build, shared }: CompareWithPlayerProps) {
  const s = STRINGS.explore
  return (
    <div>
      <p className="small-caps text-muted-foreground">{shared ? s.sharedCompareTitle : s.compareTitle}</p>
      <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2 text-[13px] leading-4 text-secondary-text">
        <span className="flex items-center gap-1.5">
          <Diamond player />
          {shared ? s.them : s.you}
        </span>
        <span className="flex items-center gap-1.5">
          <Diamond player={false} />
          {s.buildKey(legend.champion, build.archetype)}
        </span>
      </div>
      <ul className="mt-5 grid gap-2.5">
        {PLAYSTYLE_AXIS_IDS.map((axis) => {
          const def = AXES[axis]
          const player = normalize(profile[axis]) * 100
          const target = normalize(build.coordinates[axis]) * 100
          return (
            <li key={axis}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="small-caps text-muted-foreground">{def.name}</span>
                <span className="text-[13px] leading-4 font-semibold text-amber">
                  {axisGapLabel(axis, profile[axis], build.coordinates[axis])}
                </span>
              </div>
              <div className="relative mt-3.5 h-1 rounded-full bg-track">
                {[20, 40, 60, 80].map((tick) => (
                  <span key={tick} aria-hidden className="absolute top-0 h-full w-0.5 bg-background" style={{ left: `${tick}%` }} />
                ))}
                <span
                  aria-hidden
                  className="absolute top-0 h-full bg-amber/45"
                  style={{ left: `${Math.min(player, target)}%`, width: `${Math.abs(player - target)}%` }}
                />
                <Diamond player={false} className="absolute top-1/2 -translate-1/2" style={{ left: `${target}%` }} />
                <Diamond player className="absolute top-1/2 -translate-1/2" style={{ left: `${player}%` }} />
              </div>
              <div className="mt-2.5 flex justify-between text-xs leading-4 text-faint">
                <span>{def.lowLabel}</span>
                <span>{def.highLabel}</span>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[15px] leading-5 font-medium text-foreground">{gapSummary(profile, build, shared)}</p>
    </div>
  )
}
