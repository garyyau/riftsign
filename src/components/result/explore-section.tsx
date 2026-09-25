import type { Match, Profile } from '@/lib/types'

export interface ExploreSectionProps {
  matches: Match[]
  profile: Profile
  shared: boolean
  /** Legends already shown above Explore: the top Build, #2 and the More in these Domains list. */
  shownIds: string[]
}

// Stub so the Result page compiles. The real Explore section replaces this file.
export function ExploreSection(_props: ExploreSectionProps) {
  return <section id="explore" />
}
