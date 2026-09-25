import { DOMAIN_ID, normalize, PLAYSTYLE_AXIS_IDS, SCORE_MID, type Domain, type PlaystyleAxisId } from './axes'
import { clampToPool, DOMAIN_WEIGHT, playstyleGaps, PLAYSTYLE_WEIGHTS, reviewedBuilds } from './scoring'
import { GAP_WORDS, STRINGS } from './strings'
import type { Build, Legend, Match, Profile } from './types'

// The same distance rankLegends uses, rebuilt from scoring's exported weights so every Build gets its own fit.
const MAX_DISTANCE = Math.sqrt(PLAYSTYLE_AXIS_IDS.reduce((sum, axis) => sum + PLAYSTYLE_WEIGHTS[axis], 0) + 2 * DOMAIN_WEIGHT)

function distance(profile: Profile, legend: Legend, build: Build): number {
  let sum = 0
  for (const axis of PLAYSTYLE_AXIS_IDS) {
    const d = normalize(profile[axis]) - normalize(build.coordinates[axis])
    sum += PLAYSTYLE_WEIGHTS[axis] * d * d
  }
  const cost = (domain: Domain) => ((1 - (profile[DOMAIN_ID[domain]] - SCORE_MID) / SCORE_MID) / 2) ** 2
  return Math.sqrt(sum + DOMAIN_WEIGHT * (cost(legend.domains[0]) + cost(legend.domains[1])))
}

export interface BuildFit {
  build: Build
  fit: number
}

/** Each reviewed Build of a Legend with its own fit, best first. The first is the Match's Build and fit. */
export function buildFits(profile: Profile, legend: Legend, pool: Legend[]): BuildFit[] {
  const clamped = clampToPool(profile, pool)
  return reviewedBuilds(legend)
    .map((build) => ({ build, score: (1 - distance(clamped, legend, build) / MAX_DISTANCE) * 100 }))
    .sort((a, b) => b.score - a.score)
    .map(({ build, score }) => ({ build, fit: Math.round(score) }))
}

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
