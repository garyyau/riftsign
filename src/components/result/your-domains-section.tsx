import { DOMAIN_ID, DOMAINS } from '@/lib/axes'
import { STRINGS } from '@/lib/strings'
import type { DomainPicks, Profile } from '@/lib/types'
import { DomainBar } from './domain-bar'

interface YourDomainsSectionProps {
  profile: Profile
  picks: DomainPicks
  /** Viewing someone else's Riftsign: the title drops "Your". */
  shared: boolean
}

/**
 * All six Domain scores, the leading one or two highlighted, and the Legends holding them below
 * the headline Matches. With no clear lead the list gives way to a line saying so.
 */
export function YourDomainsSection({ profile, picks, shared }: YourDomainsSectionProps) {
  const s = STRINGS.result
  const { domains, matches } = picks
  return (
    <section className="border-t py-8">
      <h2 className="display text-3xl">{shared ? s.sharedDomainsTitle : s.domainsTitle}</h2>
      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <ul className="divide-y md:col-span-7">
          {DOMAINS.map((d) => (
            <DomainBar key={d} domain={d} value={profile[DOMAIN_ID[d]]} highlighted={domains.includes(d)} />
          ))}
        </ul>
        <div className="text-sm leading-relaxed text-muted-foreground md:col-span-5">
          {domains.length === 0 ? (
            <p>{s.domainsNone}</p>
          ) : (
            <>
              <p className="text-foreground">{s.domainsLead(domains)}</p>
              <p className="mt-2">{matches.length ? s.domainsLegends(domains) : s.domainsCovered}</p>
              {matches.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {matches.map((m) => (
                    <li key={m.legend.id} className="flex items-baseline justify-between gap-3 rounded-md border px-3 py-2 text-foreground">
                      <span className="min-w-0">
                        {m.legend.name}
                        <span className="label-mono ml-2 text-muted-foreground">{m.build.archetype}</span>
                      </span>
                      <span className="score-mono shrink-0">{s.fit(m.fit)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
