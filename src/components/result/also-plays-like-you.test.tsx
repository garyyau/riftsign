// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { rankLegends } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { build, CENTER, legend } from '@/lib/test-fixtures'
import type { Legend } from '@/lib/types'
import { AlsoPlaysLikeYou } from './also-plays-like-you'

const s = STRINGS.result
const rumble = (starterDeck: string | null): Legend =>
  legend('rumble', 'Midrange', {}, undefined, {
    starterDeck,
    builds: [build('Midrange', {}, { howItPlays: 'Fill the field with Mechs.', whyYou: 'You like Mechs.' })],
  })

function show(l: Legend) {
  const [match] = rankLegends(CENTER, [l])
  render(<AlsoPlaysLikeYou match={match} shared={false} />)
}

describe('AlsoPlaysLikeYou', () => {
  afterEach(cleanup)

  it('shows the rank, fit, "How it plays" and the starter deck', () => {
    show(rumble('Spiritforged Champion Deck'))
    expect(screen.getByRole('heading', { name: s.alsoPlaysTitle })).toBeTruthy()
    expect(screen.getByText(/^02/).textContent).toMatch(/^02 \/ \d+% fit$/)
    expect(screen.getByText('Fill the field with Mechs.')).toBeTruthy()
    expect(screen.queryByText('You like Mechs.')).toBeNull()
    expect(screen.getByText(s.starter('Spiritforged Champion Deck'))).toBeTruthy()
  })

  it('leaves the starter tag out when the Legend has no starter deck', () => {
    show(rumble(null))
    expect(screen.queryByText(/starter deck/i)).toBeNull()
  })
})
