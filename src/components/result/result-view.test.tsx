// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { CENTER, legend } from '@/lib/test-fixtures'
import type { Legend, Profile } from '@/lib/types'
import { ResultView, type ResultSource } from './result-view'

const s = STRINGS.result
const fast: Profile = { ...CENTER, pace: 10 }
// Both round to the same fit, so they tie on screen.
const nearTie = [legend('closest', 'Aggro', { pace: 9.95 }), legend('favourite', 'Aggro', { pace: 9.9 })]
const pool = [...nearTie, legend('third', 'Tempo', { pace: 8 }), legend('slow', 'Control', { pace: 0 })]

function show(profile: Profile, legends: Legend[], favouriteChampions: string[] = [], source: ResultSource = 'stored') {
  const shareUrl = vi.fn(() => 'url')
  render(
    <ResultView
      profile={profile}
      pool={legends}
      favouriteChampions={favouriteChampions}
      source={source}
      versionChanged={false}
      shareUrl={shareUrl}
      onRetake={() => {}}
    />,
  )
  return shareUrl
}
const cardTitles = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

describe('ResultView', () => {
  afterEach(cleanup)

  it('headlines the top two Matches and shares the Legend a recipient sees first', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } })
    const shareUrl = show(fast, pool)
    expect(cardTitles()).toEqual(['closest, Test Legend', 'favourite, Test Legend'])
    fireEvent.click(screen.getByRole('button', { name: s.share }))
    await waitFor(() => expect(shareUrl).toHaveBeenCalledWith('closest'))
  })

  it('calls out a close call between the top two by Champion, and stays quiet for a clear winner', () => {
    show(fast, nearTie)
    expect(screen.getByText(s.closeCall('closest', 'favourite'))).toBeTruthy()
    cleanup()
    show(fast, [nearTie[0], legend('slow', 'Control', { pace: 0 })])
    expect(screen.queryByText(/It was close/)).toBeNull()
  })

  it('leaves the ranking alone for favourite champions and shows the best one not already on the page', () => {
    show(fast, pool, ['slow', 'closest'])
    expect(cardTitles()).toEqual(['closest, Test Legend', 'favourite, Test Legend', 'slow, Test Legend'])
    expect(screen.getByRole('heading', { name: s.lookTitle })).toBeTruthy()
    expect(screen.getByText(`${s.lookLead('slow')} ${s.lookGaps(['slower'])}`)).toBeTruthy()
  })

  it('always shows Your Domains, with a friendly line when no Domain leads', () => {
    show({ ...CENTER, fury: 7 }, pool)
    expect(screen.getByRole('heading', { name: s.domainsTitle })).toBeTruthy()
    expect(screen.getByText(s.domainsNone)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: s.lookTitle })).toBeNull()
  })

  it('uses neutral titles on a shared Riftsign', () => {
    show(fast, pool, [], 'shared')
    for (const title of [s.sharedEyebrow, s.sharedMatchesTitle, s.sharedDomainsTitle]) expect(screen.getByText(title)).toBeTruthy()
    for (const title of [s.eyebrow, s.matchesTitle, s.domainsTitle]) expect(screen.queryByText(title)).toBeNull()
  })
})
