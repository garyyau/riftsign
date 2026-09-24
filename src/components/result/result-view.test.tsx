// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { CENTER, legend } from '@/lib/test-fixtures'
import type { Legend, Profile } from '@/lib/types'
import { ResultView } from './result-view'

const fast: Profile = { ...CENTER, pace: 10 }
// Both round to the same fit, so they tie on screen until a favourite breaks it.
const nearTie = [legend('closest', 'Aggro', { pace: 9.95 }), legend('favourite', 'Aggro', { pace: 9.9 })]

function show(profile: Profile, pool: Legend[], favouriteChampions: string[] = [], shareUrl = vi.fn(() => 'url')) {
  render(
    <ResultView
      profile={profile}
      pool={pool}
      favouriteChampions={favouriteChampions}
      source="stored"
      versionChanged={false}
      shareUrl={shareUrl}
      onRetake={() => {}}
    />,
  )
  return shareUrl
}

describe('ResultView', () => {
  afterEach(cleanup)

  it('ranks the same with favourite champions, and shares the Legend a recipient sees first', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } })
    const shareUrl = show(fast, nearTie, ['favourite'])
    expect(screen.getAllByRole('heading', { level: 3 })[0].textContent).toBe('closest, Test Legend')
    fireEvent.click(screen.getByRole('button', { name: STRINGS.result.share }))
    await waitFor(() => expect(shareUrl).toHaveBeenCalledWith('closest'))
  })

  it('calls out a close call between the top two by Champion, and stays quiet for a clear winner', () => {
    show(fast, nearTie)
    expect(screen.getByText(STRINGS.result.closeCall('closest', 'favourite'))).toBeTruthy()
    cleanup()
    show(fast, [nearTie[0], legend('slow', 'Control', { pace: 0 })])
    expect(screen.queryByText(/It was close/)).toBeNull()
  })

  it('explains a missing Domain lean instead of leaving the section empty', () => {
    show({ ...CENTER, fury: 7 }, nearTie)
    expect(screen.getByText(STRINGS.result.leanTitle)).toBeTruthy()
    expect(screen.getByText(STRINGS.result.leanNone)).toBeTruthy()
  })
})
