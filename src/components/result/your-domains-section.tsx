import { DomainTag } from '@/components/domain-tag'
import { Badge } from '@/components/ui/badge'
import { DOMAIN_ID, DOMAINS } from '@/lib/axes'
import { STRINGS } from '@/lib/strings'
import type { DomainPicks, Match, Profile } from '@/lib/types'
import { DomainBar } from './domain-bar'

interface YourDomainsSectionProps {
  profile: Profile
  picks: DomainPicks
  /** Viewing someone else's result: the title says "Their". */
  shared: boolean
  /** How many Legends Explore ranks, for the link down to it. */
  legendCount: number
}

/**
 * All six Domain scores with the leading one or two highlighted, and beside them the Legends holding
 * the lead below the headline Matches. With no clear lead, or none left to list, a line says so.
 */
export function YourDomainsSection({ profile, picks, shared, legendCount }: YourDomainsSectionProps) {
  const s = STRINGS.result
  const { domains, matches } = picks
  return (
    <section className="grid gap-12 border-t border-rule py-12 md:grid-cols-2 md:gap-16 md:py-16 lg:gap-30">
      <div>
        <h2 className="eyebrow">{shared ? s.sharedDomainsTitle : s.domainsTitle}</h2>
        <p className="mt-4 text-body font-medium text-foreground">{domains.length ? s.domainsLead(domains) : s.domainsNoLead}</p>
        <ul className="mt-6 flex flex-col gap-5">
          {DOMAINS.map((d) => (
            <DomainBar key={d} domain={d} value={profile[DOMAIN_ID[d]]} highlighted={domains.includes(d)} />
          ))}
        </ul>
      </div>
      <div>
        <h2 className="eyebrow">{domains.length ? s.moreInDomains(domains) : s.moreByDomain}</h2>
        <p className="mt-4 text-body text-secondary-text">
          {!domains.length ? s.domainsNone : matches.length ? s.domainsLegends(domains) : s.domainsCovered}
        </p>
        {domains.length > 0 && matches.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2">
            {matches.map((m) => (
              <DomainPickRow key={m.legend.id} match={m} />
            ))}
          </ul>
        )}
        {legendCount > 0 && (
          <button
            type="button"
            onClick={scrollToExplore}
            className="mt-6 cursor-pointer rounded-sm text-body font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {s.seeAll(legendCount)}
            <span aria-hidden> ↓</span>
          </button>
        )}
      </div>
    </section>
  )
}

function DomainPickRow({ match: { legend, build, fit } }: { match: Match }) {
  return (
    <li className="flex items-center gap-4 rounded-md border bg-surface py-2.5 pr-5 pl-3.5">
      <img
        src={`${import.meta.env.BASE_URL}cards/${legend.cardImage}`}
        alt=""
        loading="lazy"
        className="aspect-[5/7] w-12 shrink-0 rounded-[3px] bg-panel object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-body leading-tight font-semibold text-foreground">{legend.name}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Badge className="text-secondary-text">{build.archetype}</Badge>
          {legend.domains.map((d) => (
            <DomainTag key={d} domain={d} />
          ))}
        </div>
      </div>
      <p className="shrink-0 text-[22px] font-semibold text-amber tabular-nums">{STRINGS.result.fitPercent(fit)}</p>
    </li>
  )
}

/** Explore sits further down the page. The jump is instant for Players who prefer reduced motion. */
function scrollToExplore() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById('explore')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}
