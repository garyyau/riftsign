// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFits } from '@/lib/scoring'
import { rankLegends } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { build, CENTER, legend } from '@/lib/test-fixtures'
import type { Profile } from '@/lib/types'
import { ExploreSection } from './explore-section'

const s = STRINGS.explore
const profile: Profile = { ...CENTER, pace: 9 }
const lux = legend('lux', 'Combo', {}, ['Calm', 'Mind'], {
  name: 'Lux, Lady of Luminosity',
  champion: 'Lux',
  builds: [build('Control', { pace: 2, stance: 2 }, { howItPlays: 'Hold the answers.' }), build('Combo', { pace: 7.1 }, { howItPlays: 'Assemble the loop.' })],
})
const pool = [
  legend('zed', 'Aggro', { pace: 9 }, undefined, { name: 'Zed, Master of Shadows', champion: 'Zed' }),
  legend('ahri', 'Tempo', { pace: 8 }, undefined, { name: 'Ahri, Nine-Tailed Fox', champion: 'Ahri' }),
  lux,
  legend('yi-master', 'Midrange', { pace: 5 }, undefined, { name: 'Master Yi, Wuju Master', champion: 'Master Yi' }),
  legend('yi-blade', 'Control', { pace: 1 }, undefined, { name: 'Master Yi, Wuju Bladesman', champion: 'Master Yi' }),
]
const matches = rankLegends(profile, pool)

function show({ shared = false, shownIds = ['zed', 'ahri'] } = {}) {
  render(<ExploreSection matches={matches} profile={profile} shared={shared} shownIds={shownIds} />)
}
// The rank line keeps its double spaces, which getByText collapses by default.
const asIs = { normalizer: (text: string) => text }
const panel = () => screen.getByRole('article')
const portraits = () => screen.queryAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'))
const portraitLabels = () => portraits().map((b) => b.getAttribute('aria-label'))
const pressed = () => portraits().filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.getAttribute('aria-label'))

describe('ExploreSection', () => {
  afterEach(cleanup)

  it('ranks the pool as expected for these tests', () => {
    expect(matches.map((m) => m.legend.id)).toEqual(['zed', 'ahri', 'lux', 'yi-master', 'yi-blade'])
  })

  it('starts on the best-ranked Legend not already shown', () => {
    show()
    expect(pressed()).toEqual([s.portraitLabel(3, lux.name)])
    expect(within(panel()).getByRole('heading', { name: lux.name })).toBeTruthy()
    expect(within(panel()).getByText(s.rankOf(3, 5, matches[2].fit), asIs)).toBeTruthy()
    cleanup()
    show({ shownIds: pool.map((l) => l.id) })
    expect(pressed()).toEqual([s.portraitLabel(1, 'Zed, Master of Shadows')])
  })

  it('keeps fit ranks when sorted A to Z', () => {
    show()
    fireEvent.change(screen.getByRole('combobox', { name: s.sortLabel }), { target: { value: 'name' } })
    expect(portraitLabels()).toEqual([
      '#2 Ahri, Nine-Tailed Fox',
      '#3 Lux, Lady of Luminosity',
      '#5 Master Yi, Wuju Bladesman',
      '#4 Master Yi, Wuju Master',
      '#1 Zed, Master of Shadows',
    ])
  })

  it('tells apart champions with more than one Legend', () => {
    show()
    expect(screen.getByText('Wuju Master')).toBeTruthy()
    expect(screen.getByText('Wuju Bladesman')).toBeTruthy()
    expect(screen.queryByText('Nine-Tailed Fox')).toBeNull()
  })

  it('filters by search and says so when nothing matches, keeping the panel', () => {
    show()
    const search = screen.getByRole('searchbox', { name: s.searchPlaceholder(5) })
    fireEvent.change(search, { target: { value: 'master' } })
    expect(portraitLabels()).toEqual(['#1 Zed, Master of Shadows', '#4 Master Yi, Wuju Master', '#5 Master Yi, Wuju Bladesman'])
    expect(within(panel()).getByRole('heading', { name: lux.name })).toBeTruthy()
    fireEvent.change(search, { target: { value: 'Teemo' } })
    expect(portraits()).toEqual([])
    expect(screen.getByText(s.noResults('Teemo'))).toBeTruthy()
    expect(within(panel()).getByRole('heading', { name: lux.name })).toBeTruthy()
  })

  it('shows a clicked portrait in the panel', () => {
    show()
    fireEvent.click(screen.getByRole('button', { name: '#4 Master Yi, Wuju Master' }))
    expect(pressed()).toEqual(['#4 Master Yi, Wuju Master'])
    expect(within(panel()).getByRole('heading', { name: 'Master Yi, Wuju Master' })).toBeTruthy()
    expect(within(panel()).queryByRole('radiogroup')).toBeNull()
  })

  it('switches Build and fit with the Build picker, starting on the best fit', () => {
    show()
    const [best, other] = buildFits(profile, pool, lux)
    expect(best.build.archetype).toBe('Combo')
    expect(best.fit).toBe(matches[2].fit)
    const p = within(panel())
    const combo = p.getByRole('radio', { name: new RegExp(`^Combo.*${STRINGS.result.fit(best.fit)}$`) }) as HTMLInputElement
    const control = p.getByRole('radio', { name: new RegExp(`^Control.*${STRINGS.result.fit(other.fit)}$`) }) as HTMLInputElement
    expect(combo.checked).toBe(true)
    expect(p.getByText('Assemble the loop.')).toBeTruthy()
    expect(p.getByText(s.buildKey('Lux', 'Combo'))).toBeTruthy()

    fireEvent.click(control)
    expect(control.checked).toBe(true)
    expect(p.getByText(s.rankOf(3, 5, other.fit), asIs)).toBeTruthy()
    expect(p.getByText('Hold the answers.')).toBeTruthy()
    expect(p.getByText('Control', { selector: '.text-primary' })).toBeTruthy()
    expect(p.getByText(s.buildKey('Lux', 'Control'))).toBeTruthy()
    expect(p.getByText("It's slower and more reactive than you like.")).toBeTruthy()
  })

  it('words each Axis gap, with About the same for no gap', () => {
    show()
    const p = within(panel())
    // Lux as Combo: pace 7.1 against 9, everything else level with the Player.
    expect(p.getByText('1.9 slower')).toBeTruthy()
    expect(p.getAllByText(s.same)).toHaveLength(3)
    expect(p.getByText(s.close)).toBeTruthy()
  })

  it('uses third-person copy on a shared result', () => {
    show({ shared: true })
    for (const text of [s.sharedLead, s.sharedCompareTitle, s.them, s.sharedClose]) expect(screen.getByText(text)).toBeTruthy()
    for (const text of [s.lead, s.compareTitle, s.you, s.close]) expect(screen.queryByText(text)).toBeNull()
  })
})
