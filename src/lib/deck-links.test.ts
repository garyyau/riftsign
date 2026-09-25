import { describe, expect, it } from 'vitest'
import { LEGENDS } from '@/data'
import { deckLink, GENERIC_DECKS_URL } from './deck-links'

const kaisa = LEGENDS.find((l) => l.id === 'kaisa-daughter-of-the-void')!

describe('deckLink', () => {
  it("uses a Build's own deck list when it has one", () => {
    const control = kaisa.builds.find((b) => b.archetype === 'Control')!
    expect(deckLink(kaisa, control)).toEqual({ featured: true, url: control.deckListUrl })
  })

  it('falls back to the deck browser filtered to the Legend', () => {
    const midrange = kaisa.builds.find((b) => b.archetype === 'Midrange')!
    expect(deckLink(kaisa, midrange)).toEqual({
      featured: false,
      url: `${GENERIC_DECKS_URL}?legends=77b2953a-5214-4421-862d-f33d8bc4590b`,
    })
  })

  it('has a Piltover Archive id for every Legend', () => {
    for (const legend of LEGENDS) expect(deckLink(legend, { ...legend.builds[0], deckListUrl: GENERIC_DECKS_URL }).url).toContain('?legends=')
  })
})
