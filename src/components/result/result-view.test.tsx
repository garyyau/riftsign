// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ARCHETYPE_COPY, STRINGS } from '@/lib/strings'
import { CENTER, legend } from '@/lib/test-fixtures'
import type { Legend, Profile } from '@/lib/types'
import { ResultView, type ResultSource } from './result-view'

const s = STRINGS.result
const fast: Profile = { ...CENTER, pace: 10 }
// Both round to the same fit, so they tie on screen.
const nearTie = [legend('closest', 'Aggro', { pace: 9.95 }), legend('runner-up', 'Aggro', { pace: 9.9 })]
const pool = [...nearTie, legend('third', 'Tempo', { pace: 8 }), legend('slow', 'Control', { pace: 0 })]

function show(profile: Profile, legends: Legend[], source: ResultSource = 'stored') {
  const shareUrl = vi.fn(() => 'url')
  render(
    <ResultView
      profile={profile}
      pool={legends}
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
    expect(cardTitles()).toEqual(['closest, Test Legend', 'runner-up, Test Legend'])
    fireEvent.click(screen.getByRole('button', { name: s.share }))
    await waitFor(() => expect(shareUrl).toHaveBeenCalledWith('closest'))
  })

  it('calls out a close call between the top two by Champion, and stays quiet for a clear winner', () => {
    show(fast, nearTie)
    expect(screen.getByText(s.closeCall('closest', 'runner-up'))).toBeTruthy()
    cleanup()
    show(fast, [nearTie[0], legend('slow', 'Control', { pace: 0 })])
    expect(screen.queryByText(/It was close/)).toBeNull()
  })

  it('always shows Your Domains, with a friendly line when no Domain leads', () => {
    show({ ...CENTER, fury: 7 }, pool)
    expect(screen.getByRole('heading', { name: s.domainsTitle })).toBeTruthy()
    expect(screen.getByText(s.domainsNone)).toBeTruthy()
  })

  it('uses neutral copy on a shared result', () => {
    show(fast, pool, 'shared')
    const neutral = [s.sharedEyebrow, s.sharedMatchesTitle, s.sharedDomainsTitle, ARCHETYPE_COPY.Aggro.sharedDescription, s.sharedCloseCall('closest', 'runner-up')]
    for (const text of neutral) expect(screen.getByText(text)).toBeTruthy()
    const personal = [s.eyebrow, s.matchesTitle, s.domainsTitle, ARCHETYPE_COPY.Aggro.description, s.closeCall('closest', 'runner-up')]
    for (const text of personal) expect(screen.queryByText(text)).toBeNull()
  })
})
