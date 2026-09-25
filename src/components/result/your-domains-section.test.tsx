// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DOMAINS } from '@/lib/axes'
import { DOMAIN_HIGHLIGHT_THRESHOLD, domainPicks, rankLegends } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { CENTER, legend } from '@/lib/test-fixtures'
import type { Profile } from '@/lib/types'
import { YourDomainsSection } from './your-domains-section'

const s = STRINGS.result
const pool = [
  legend('head-1', 'Aggro', { pace: 10 }, ['Fury', 'Order']),
  legend('head-2', 'Aggro', { pace: 9.9 }, ['Fury', 'Order']),
  legend('pair', 'Midrange', { pace: 6 }, ['Order', 'Fury']),
  legend('other', 'Control', { pace: 0 }, ['Calm', 'Mind']),
]

function show(scores: Partial<Profile>, shared = false, legends = pool) {
  const profile = { ...CENTER, pace: 10, ...scores }
  render(<YourDomainsSection profile={profile} picks={domainPicks(profile, rankLegends(profile, legends))} shared={shared} />)
}
const highlighted = () => screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-highlighted'))

describe('YourDomainsSection', () => {
  afterEach(cleanup)

  it('shows all six Domains, highlights the leading pair and lists its other Legends with their fit', () => {
    show({ fury: 9, order: 8.5 })
    expect(screen.getByRole('heading', { name: s.domainsTitle })).toBeTruthy()
    for (const d of DOMAINS) expect(screen.getAllByText(d).length).toBeGreaterThan(0)
    expect(highlighted().map((li) => li.textContent)).toEqual([expect.stringContaining('Fury'), expect.stringContaining('Order')])
    expect(screen.getByText(s.domainsLead(['Fury', 'Order']))).toBeTruthy()
    const row = screen.getByText('pair, Test Legend').closest('li')!
    expect(within(row).getByText(/% fit$/)).toBeTruthy()
    expect(screen.queryByText('head-1, Test Legend')).toBeNull()
  })

  it('labels each bar with the same line the highlight uses, so a bar never claims a pull the section denies', () => {
    show({ calm: 5 + DOMAIN_HIGHLIGHT_THRESHOLD - 0.1 })
    expect(screen.queryByText(s.domainFeeling.pull)).toBeNull()
    expect(screen.getByText(s.domainsNone)).toBeTruthy()
  })

  it('hides the highlight and the list with a friendly line when no Domain clearly leads', () => {
    show({})
    expect(highlighted()).toEqual([])
    expect(screen.getByText(s.domainsNone)).toBeTruthy()
    expect(screen.queryByText(/best fit first/)).toBeNull()
  })

  it('says the headline already covers the lead when no other Legend holds it', () => {
    show({ fury: 9, order: 8.5 }, false, pool.slice(0, 2))
    expect(screen.getByText(s.domainsLead(['Fury', 'Order']))).toBeTruthy()
    expect(screen.getByText(s.domainsCovered)).toBeTruthy()
  })

  it('drops "Your" from the title on a shared result', () => {
    show({}, true)
    expect(screen.getByRole('heading', { name: s.sharedDomainsTitle })).toBeTruthy()
    expect(screen.queryByText(s.domainsTitle)).toBeNull()
  })
})
