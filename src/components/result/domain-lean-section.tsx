import { DomainBadge } from '@/components/domain-badge'
import { STRINGS } from '@/lib/strings'
import type { DomainLean } from '@/lib/types'

export function DomainLeanSection({ lean }: { lean: DomainLean }) {
  const s = STRINGS.result
  const [a, b] = lean.domains
  return (
    <section className="border-t py-8">
      <p className="label-mono text-muted-foreground">{s.leanTitle}</p>
      <div className="mt-3 flex items-center gap-3">
        <DomainBadge domain={a} className="text-foreground" />
        <DomainBadge domain={b} className="text-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{lean.legends.length ? s.leanBody(a, b) : s.leanEmpty(a, b)}</p>
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
