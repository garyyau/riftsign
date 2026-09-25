import archiveIds from '@/data/piltover-archive.json'
import type { Build, Legend } from './types'

/** The deckListUrl a Build carries when no single deck list has been picked for it. */
export const GENERIC_DECKS_URL = 'https://piltoverarchive.com/decks'

const ARCHIVE_IDS: Record<string, string | undefined> = archiveIds

export interface DeckLink {
  /** True when the Build links one chosen deck list rather than a browse page. */
  featured: boolean
  url: string
}

/** A Build's own deck list, or else Piltover Archive's deck browser filtered to the Legend. */
export function deckLink(legend: Legend, build: Build): DeckLink {
  if (build.deckListUrl !== GENERIC_DECKS_URL) return { featured: true, url: build.deckListUrl }
  const id = ARCHIVE_IDS[legend.id]
  return { featured: false, url: id ? `${GENERIC_DECKS_URL}?legends=${id}` : GENERIC_DECKS_URL }
}
