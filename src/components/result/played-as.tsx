import { STRINGS } from '@/lib/strings'
import type { Archetype } from '@/lib/types'
import { cn } from '@/lib/utils'

/** "played as Midrange", with the Archetype picked out in cyan. */
export function PlayedAs({ archetype, className }: { archetype: Archetype; className?: string }) {
  return (
    <p className={cn('text-muted-foreground', className)}>
      {STRINGS.result.playedAs} <span className="font-semibold text-primary">{archetype}</span>
    </p>
  )
}
