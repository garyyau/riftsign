import { DomainBadge } from '@/components/domain-badge'
import { STRINGS } from '@/lib/strings'
import type { DomainPicks } from '@/lib/types'

export function DomainLeanSection({ picks }: { picks: DomainPicks }) {
  const s = STRINGS.result
  const body =
    picks.domains.length === 0 ? s.leanNone : picks.matches.length ? s.leanBody(picks.domains) : s.leanEmpty(picks.domains)
  return (
    <section className="border-t py-8">
      <p className="label-mono text-muted-foreground">{s.leanTitle}</p>
      {picks.domains.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          {picks.domains.map((d) => (
            <DomainBadge key={d} domain={d} className="text-foreground" />
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">{body}</p>
      {picks.matches.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {picks.matches.map((m) => (
            <li key={m.legend.id} className="rounded-md border px-3 py-2 text-sm">
              {m.legend.name}
              <span className="label-mono ml-2 text-muted-foreground">{m.build.archetype}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
