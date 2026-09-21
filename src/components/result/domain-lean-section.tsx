import { DomainBadge } from '@/components/domain-badge'
import { STRINGS } from '@/lib/strings'
import type { DomainLean } from '@/lib/types'

export function DomainLeanSection({ lean }: { lean: DomainLean }) {
  const s = STRINGS.result
  const body =
    lean.domains.length === 0 ? s.leanNone : lean.legends.length ? s.leanBody(lean.domains) : s.leanEmpty(lean.domains)
  return (
    <section className="border-t py-8">
      <p className="label-mono text-muted-foreground">{s.leanTitle}</p>
      {lean.domains.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          {lean.domains.map((d) => (
            <DomainBadge key={d} domain={d} className="text-foreground" />
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">{body}</p>
      {lean.legends.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {lean.legends.map((l) => (
            <li key={l.id} className="rounded-md border px-3 py-2 text-sm">
              {l.name}
              <span className="label-mono ml-2 text-muted-foreground">{l.archetype}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
