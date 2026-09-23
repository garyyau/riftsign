import { ChevronDown } from 'lucide-react'
import { DomainBadge } from '@/components/domain-badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { STRINGS } from '@/lib/strings'
import type { Match } from '@/lib/types'
import { stepNumber } from '@/lib/utils'

export function RankingList({ matches }: { matches: Match[] }) {
  return (
    <Collapsible className="border-t">
      <CollapsibleTrigger className="label-mono group flex w-full cursor-pointer items-center justify-between py-5 text-left text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {STRINGS.result.fullRanking(matches.length)}
        <ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="divide-y border-t">
          {matches.map((m, i) => (
            <li key={m.legend.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-3 text-sm">
              <span className="score-mono text-muted-foreground">{stepNumber(i + 1)}</span>
              <span className="min-w-0">
                <span className="block truncate">{m.legend.name}</span>
                <span className="mt-1 flex flex-wrap gap-3">
                  <span className="label-mono text-muted-foreground">{m.build.archetype}</span>
                  {m.legend.domains.map((d) => (
                    <DomainBadge key={d} domain={d} />
                  ))}
                </span>
              </span>
              <span className="score-mono">{m.fit}%</span>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  )
}
