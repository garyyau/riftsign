import type { PlaystyleAxisId } from './axes'
import { playstyleGaps } from './scoring'
import { GAP_WORDS, STRINGS } from './strings'
import type { Build, Match, Profile } from './types'

/** The best-ranked Legend not already shown higher on the page, else the top Match. */
export function defaultExploreId(matches: Match[], shownIds: string[]): string | undefined {
  return (matches.find((m) => !shownIds.includes(m.legend.id)) ?? matches[0])?.legend.id
}

export type ExploreSort = 'fit' | 'name'

export interface RankedMatch {
  match: Match
  /** 1-based position in the fit ranking. Sorting and search never change it. */
  rank: number
}

/** The carousel: every Match with its fit rank, narrowed by a case-insensitive name search, then sorted. */
export function exploreStrip(matches: Match[], sort: ExploreSort, query: string): RankedMatch[] {
  const q = query.trim().toLowerCase()
  // Legend names start with the champion ("Champion, Subtitle"), so the name covers both.
  const hits = matches
    .map((match, i) => ({ match, rank: i + 1 }))
    .filter(({ match }) => match.legend.name.toLowerCase().includes(q))
  return sort === 'name' ? hits.sort((a, b) => a.match.legend.name.localeCompare(b.match.legend.name)) : hits
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** How far a Build sits from the Player on one Axis: "0.3 faster", or "About the same" when it rounds to 0.0. */
export function axisGapLabel(axis: PlaystyleAxisId, playerScore: number, buildScore: number): string {
  const gap = round1(buildScore - playerScore)
  if (gap === 0) return STRINGS.explore.same
  return STRINGS.explore.gap(Math.abs(gap).toFixed(1), GAP_WORDS[axis][gap > 0 ? 0 : 1])
}

/** The summary names at most this many playstyle gaps, biggest first. */
const MAX_SUMMARY_GAPS = 2

/** One line on how the Build differs from the Player, counting only gaps of a band or more. */
export function gapSummary(profile: Profile, build: Build, shared: boolean): string {
  const s = STRINGS.explore
  const words = playstyleGaps(profile, build)
    .slice(0, MAX_SUMMARY_GAPS)
    .map((g) => GAP_WORDS[g.axis][g.gap > 0 ? 0 : 1])
  if (!words.length) return shared ? s.sharedClose : s.close
  return shared ? s.sharedGaps(words) : s.gaps(words)
}
