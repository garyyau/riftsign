// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { rankLegends } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { CENTER, legend } from '@/lib/test-fixtures'
import type { Match, Profile } from '@/lib/types'
import { LookYouLike } from './look-you-like'

const s = STRINGS.result
const player: Profile = { ...CENTER, pace: 3, variance: 3 }
const matchOf = (coords: Parameters<typeof legend>[2]) => rankLegends(player, [legend('jinx', 'Aggro', coords)])[0]

function show(favouriteChampions: string[], pick: Match | null) {
  return render(<LookYouLike profile={player} favouriteChampions={favouriteChampions} pick={pick} />)
}

describe('LookYouLike', () => {
  afterEach(cleanup)

  it('shows the favourite champion Legend with an honest line on how its playstyle differs', () => {
    show(['jinx'], matchOf({ pace: 9, variance: 6, stance: 6 }))
    expect(screen.getByRole('heading', { name: s.lookTitle })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'jinx, Test Legend' })).toBeTruthy()
    expect(screen.getByText(/% fit$/)).toBeTruthy()
    // Pace is 6 faster and variance 3 swingier; stance at 1 away is too close to mention.
    expect(screen.getByText(`${s.lookLead('jinx')} ${s.lookGaps(['faster', 'swingier'])}`)).toBeTruthy()
  })

  it('says so when the Legend plays close to the Player', () => {
    show(['jinx'], matchOf({ pace: 4, variance: 3 }))
    expect(screen.getByText(`${s.lookLead('jinx')} ${s.lookClose}`)).toBeTruthy()
  })

  it('is hidden when the Player named no favourite champions', () => {
    const { container } = show([], matchOf({}))
    expect(container.innerHTML).toBe('')
  })

  it('says the favourites are already shown when there is nothing new to add', () => {
    show(['jinx'], null)
    expect(screen.getByRole('heading', { name: s.lookTitle })).toBeTruthy()
    expect(screen.getByText(s.lookCovered)).toBeTruthy()
  })
})
