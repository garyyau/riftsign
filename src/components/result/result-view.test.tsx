// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFit } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { build, CENTER, legend } from '@/lib/test-fixtures'
import type { Legend, Profile } from '@/lib/types'
import { ResultView, type ResultSource } from './result-view'

const s = STRINGS.result
const fast: Profile = { ...CENTER, pace: 10 }
const top = legend('top', 'Aggro', {}, undefined, {
  builds: [
    build('Aggro', { pace: 10 }, { whyYou: 'Why Aggro.' }),
    build('Control', { pace: 0 }, { whyYou: 'Why Control.' }),
    build('Combo', { pace: 4 }, { whyYou: 'Why Combo.' }),
  ],
})
const pool = [top, legend('runner-up', 'Aggro', { pace: 9 }), legend('slow', 'Control', { pace: 0 })]

function show(profile: Profile, legends: Legend[], source: ResultSource = 'stored', versionChanged = false) {
  const shareUrl = vi.fn(() => 'url')
  render(<ResultView profile={profile} pool={legends} source={source} versionChanged={versionChanged} shareUrl={shareUrl} onRetake={() => {}} />)
  return shareUrl
}
const hero = () => within(screen.getByRole('heading', { level: 1 }).closest('section')!)

describe('ResultView', () => {
  afterEach(cleanup)

  it('leads with the top Build and #2, and shares the Legend a recipient sees first', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } })
    const shareUrl = show(fast, pool)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('top, Test Legend')
    // The Explore panel below also names a Legend in an h3; #2 comes first.
    expect(screen.getAllByRole('heading', { level: 3 })[0].textContent).toBe('runner-up, Test Legend')
    expect(hero().getByText(s.topBuild)).toBeTruthy()
    expect(hero().getByText('Why Aggro.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: s.share }))
    await waitFor(() => expect(shareUrl).toHaveBeenCalledWith('top'))
  })

  it('swaps the hero to another Build from "Also played as" and back to the best fit', () => {
    show(fast, pool)
    fireEvent.click(hero().getByRole('button', { name: 'Control' }))
    expect(hero().getByText(s.otherBuild)).toBeTruthy()
    expect(hero().getByText(s.fit(buildFit(fast, pool, top, top.builds[1])))).toBeTruthy()
    expect(hero().getByText('Why Control.')).toBeTruthy()
    expect(hero().queryByText('Why Aggro.')).toBeNull()
    expect(hero().getByText(/^played as/).textContent).toBe(`${s.playedAs} Control`)
    expect(hero().getByText(s.bestFit, { exact: false })).toBeTruthy()

    fireEvent.click(hero().getByRole('button', { name: 'Aggro' }))
    expect(hero().getByText(s.topBuild)).toBeTruthy()
    expect(hero().getByText('Why Aggro.')).toBeTruthy()
    expect(hero().queryByText(s.bestFit, { exact: false })).toBeNull()
    expect(hero().getByRole('button', { name: 'Control' })).toBeTruthy()
  })

  it('tags the hero with its starter deck only when it has one', () => {
    show(fast, pool)
    expect(hero().queryByText(s.starter('Box'))).toBeNull()
    cleanup()
    show(fast, [{ ...top, starterDeck: 'Box' }, ...pool.slice(1)])
    expect(hero().getByText(s.starter('Box'))).toBeTruthy()
  })

  it('hides "Also played as" for a Legend with one Build', () => {
    show(fast, pool.slice(1))
    expect(screen.queryByText(s.alsoPlayed, { exact: false })).toBeNull()
  })

  it('always shows Your Domains, with a friendly line when no Domain leads', () => {
    show({ ...CENTER, fury: 7 }, pool)
    expect(screen.getByRole('heading', { name: s.domainsTitle })).toBeTruthy()
    expect(screen.getByText(s.domainsNone)).toBeTruthy()
  })

  it('shows a shared result in the third person, with a banner and no share button', () => {
    show(fast, pool, 'shared')
    expect(screen.getByText(s.sharedNotice)).toBeTruthy()
    for (const text of [s.sharedTopBuild, s.sharedAlsoPlaysTitle, s.sharedPlaystyleTitle, s.sharedDomainsTitle]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
    for (const text of [s.topBuild, s.alsoPlaysTitle, s.playstyleTitle, s.domainsTitle, s.retake]) {
      expect(screen.queryByText(text)).toBeNull()
    }
    expect(screen.queryByRole('button', { name: s.share })).toBeNull()
    expect(screen.getAllByRole('button', { name: s.takeOwn })).toHaveLength(2)
  })

  it('notes an older Question set in the same banner, worded for whose result it is', () => {
    show(fast, pool, 'stored', true)
    expect(screen.getByText(s.versionNotice)).toBeTruthy()
    cleanup()
    show(fast, pool, 'shared', true)
    expect(screen.getByText(s.olderLinkNotice)).toBeTruthy()
  })
})
