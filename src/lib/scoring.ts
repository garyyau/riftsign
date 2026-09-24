import {
  DOMAIN_ID,
  DOMAINS,
  normalize,
  PLAYSTYLE_AXIS_IDS,
  SCORE_IDS,
  SCORE_MID,
  type Domain,
  type PlaystyleAxisId,
  type ScoreId,
} from './axes'
import type { Answer, Answers, Archetype, Build, DomainPicks, Legend, Match, Profile, Question, QuestionSet } from './types'

export const STATEMENT_POINTS = [
  { id: 'strongly-disagree', text: 'Strongly disagree', factor: -1 },
  { id: 'disagree', text: 'Disagree', factor: -0.5 },
  { id: 'neutral', text: 'Neutral', factor: 0 },
  { id: 'agree', text: 'Agree', factor: 0.5 },
  { id: 'strongly-agree', text: 'Strongly agree', factor: 1 },
] as const

/** Every Question presents as a list of Answers. A scenario lists its own; a statement expands to five points. */
export function answersOf(question: Question): Answer[] {
  if (question.kind === 'scenario') return question.answers
  return STATEMENT_POINTS.map((p) => ({
    id: p.id,
    text: p.text,
    moves: question.agreeMoves.map((m) => ({ axis: m.axis, weight: m.weight * p.factor })),
  }))
}

type Extremes = Record<ScoreId, { positive: number; negative: number }>

/** The furthest each score can be pushed in either direction by this Question set. */
function extremes(set: QuestionSet): Extremes {
  const out = Object.fromEntries(SCORE_IDS.map((id) => [id, { positive: 0, negative: 0 }])) as Extremes
  for (const question of set.questions) {
    const perScore: Partial<Extremes> = {}
    for (const answer of answersOf(question)) {
      for (const move of answer.moves) {
        const slot = (perScore[move.axis] ??= { positive: 0, negative: 0 })
        slot.positive = Math.max(slot.positive, move.weight)
        slot.negative = Math.min(slot.negative, move.weight)
      }
    }
    for (const [id, slot] of Object.entries(perScore) as [ScoreId, { positive: number; negative: number }][]) {
      out[id].positive += slot.positive
      out[id].negative += slot.negative
    }
  }
  return out
}

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Each score is 5 + (raw / reach) × 5, where reach is the furthest the set can push it either way.
 * One reach for both directions keeps a small penalty small: a three-way Domain choice gives +2 to
 * the pick and −1 to the other two, and not picking a Domain shouldn't read as hating it.
 */
export function computeProfile(set: QuestionSet, answers: Answers): Profile {
  const raw = Object.fromEntries(SCORE_IDS.map((id) => [id, 0])) as Record<ScoreId, number>
  for (const question of set.questions) {
    const chosen = answersOf(question).find((a) => a.id === answers[question.id])
    for (const move of chosen?.moves ?? []) raw[move.axis] += move.weight
  }
  const limits = extremes(set)
  const profile = {} as Profile
  for (const id of SCORE_IDS) {
    const value = raw[id]
    const reach = Math.max(limits[id].positive, -limits[id].negative)
    profile[id] = reach === 0 ? SCORE_MID : round1(SCORE_MID + (value / reach) * SCORE_MID)
  }
  return profile
}

/**
 * Distance weights (ADRs 0004 and 0005). Each playstyle Axis adds its normalised squared gap times
 * its weight; the Domain term adds DOMAIN_WEIGHT times the Legend's two Domain costs. Domain weighs
 * less so playstyle leads the Match. Adjust here after an audit (`pnpm simulate`), nowhere else.
 */
export const PLAYSTYLE_WEIGHTS: Record<PlaystyleAxisId, number> = { pace: 1, stance: 1, complexity: 1, variance: 1 }
export const DOMAIN_WEIGHT = 0.5

// Both Domain costs at their maximum of 1 is the furthest a Profile can sit from a Legend.
const MAX_DISTANCE = Math.sqrt(PLAYSTYLE_AXIS_IDS.reduce((sum, axis) => sum + PLAYSTYLE_WEIGHTS[axis], 0) + 2 * DOMAIN_WEIGHT)

/**
 * How far the Player is from one Domain. Affinity runs from -1 (score 0) through 0 (score 5, no
 * feeling) to 1 (score 10); the cost falls from 1 through 0.25 at neutral to 0.
 */
function domainCost(profile: Profile, domain: Domain): number {
  const affinity = (profile[DOMAIN_ID[domain]] - SCORE_MID) / SCORE_MID
  return ((1 - affinity) / 2) ** 2
}

/**
 * The Domain part of the distance: the Player's cost for each of the Legend's two Domains.
 * Domains the Legend doesn't hold add nothing, so a fully neutral Player pays the same for every
 * Legend. Opposite-pair Legends need no special case: they hold two Domains like any other.
 */
function domainTerm(profile: Profile, legend: Legend): number {
  return DOMAIN_WEIGHT * (domainCost(profile, legend.domains[0]) + domainCost(profile, legend.domains[1]))
}

function playstyleTerm(profile: Profile, build: Build): number {
  let sum = 0
  for (const axis of PLAYSTYLE_AXIS_IDS) {
    const d = normalize(profile[axis]) - normalize(build.coordinates[axis])
    sum += PLAYSTYLE_WEIGHTS[axis] * d * d
  }
  return sum
}

/** Only reviewed Builds can appear in a Match. A Legend with none is not in the pool. */
export const reviewedBuilds = (legend: Legend): Build[] => legend.builds.filter((b) => b.reviewed)

/**
 * The Profile with each playstyle score pulled inside the range the pool's Builds cover. A Player
 * at 0 or 10 is past every Build, and the overshoot would make that one Axis dominate the distance.
 * Matching only; the shown Profile keeps the raw scores.
 */
export function clampToPool(profile: Profile, pool: Legend[]): Profile {
  const builds = pool.flatMap(reviewedBuilds)
  if (!builds.length) return profile
  const out = { ...profile }
  for (const axis of PLAYSTYLE_AXIS_IDS) {
    const values = builds.map((b) => b.coordinates[axis])
    out[axis] = Math.min(Math.max(profile[axis], Math.min(...values)), Math.max(...values))
  }
  return out
}

/**
 * One Match per Legend, scored on whichever of its reviewed Builds sits closest to the Profile.
 * Favourite champions don't change fit; the result page shows them separately (ADR 0005).
 */
export function rankLegends(rawProfile: Profile, pool: Legend[]): Match[] {
  const profile = clampToPool(rawProfile, pool)
  return pool
    .flatMap((legend) => {
      const domain = domainTerm(profile, legend)
      const scored = reviewedBuilds(legend).map((build) => ({ build, d: Math.sqrt(playstyleTerm(profile, build) + domain) }))
      if (!scored.length) return []
      const { build, d } = scored.reduce((best, s) => (s.d < best.d ? s : best))
      return [{ legend, build, score: (1 - d / MAX_DISTANCE) * 100 }]
    })
    .sort((a, b) => b.score - a.score || a.legend.name.localeCompare(b.legend.name))
    .map(({ legend, build, score }) => ({ legend, build, fit: Math.round(score) }))
}

/** How many top Matches the result page headlines as "Legends that play like you". */
export const HEADLINE_MATCHES = 2

/** Top two Matches within this many fit points of each other count as a tie for the headline. */
export const ARCHETYPE_TIE_MARGIN = 3

/**
 * Top two Matches within this many fit points of each other are called a close call on the
 * result page. 0 means the same shown fit. Retune with `pnpm simulate`, separately from the tie margin.
 */
export const CLOSE_CALL_MARGIN = 0

/** The top two Matches when their fits sit within the close-call margin, else null. */
export function closeCall(matches: Match[]): [Match, Match] | null {
  const [first, second] = matches
  return first && second && first.fit - second.fit <= CLOSE_CALL_MARGIN ? [first, second] : null
}

/**
 * The Archetype of the top Match, unless the top two disagree and sit within the tie
 * margin. Then the Archetype with the higher mean fit across the top five wins, which
 * keeps the headline from flipping on a one-point difference.
 */
export function deriveArchetype(matches: Match[]): Archetype | null {
  const [first, second] = matches
  if (!first) return null
  if (!second || first.build.archetype === second.build.archetype) return first.build.archetype
  if (first.fit - second.fit > ARCHETYPE_TIE_MARGIN) return first.build.archetype

  const topFive = matches.slice(0, 5)
  const meanFit = (archetype: Archetype) => {
    const fits = topFive.filter((m) => m.build.archetype === archetype).map((m) => m.fit)
    return fits.reduce((a, b) => a + b, 0) / fits.length
  }
  return meanFit(second.build.archetype) > meanFit(first.build.archetype)
    ? second.build.archetype
    : first.build.archetype
}

/**
 * A Domain the Player feels this far from neutral (5) about counts as a pull or a push. The same
 * line decides the bar labels and which Domains "Your Domains" highlights, so they never disagree.
 * A Domain sits in three or four three-way choices, so picking it twice and passing once lands
 * near 7.5. 2.5 names most fans' pair and still stays quiet for every Domain-neutral Player
 * (`pnpm simulate`, ADR 0006).
 */
export const DOMAIN_HIGHLIGHT_THRESHOLD = 2.5

export type DomainFeeling = 'pull' | 'neutral' | 'push'

export function domainFeeling(score: number, threshold = DOMAIN_HIGHLIGHT_THRESHOLD): DomainFeeling {
  return score >= SCORE_MID + threshold ? 'pull' : score <= SCORE_MID - threshold ? 'push' : 'neutral'
}

/**
 * The one or two Domains that clearly lead: the top two by score when both are pulls and the
 * second is strictly ahead of the third, else the top one on the same terms, else none. A tie at
 * the cut would make the pick arbitrary, so the tied Domains are left out.
 */
export function leadingDomains(profile: Profile, threshold = DOMAIN_HIGHLIGHT_THRESHOLD): Domain[] {
  const ranked = [...DOMAINS].sort((a, b) => profile[DOMAIN_ID[b]] - profile[DOMAIN_ID[a]])
  const score = (i: number) => profile[DOMAIN_ID[ranked[i]]]
  for (const k of [2, 1]) {
    if (domainFeeling(score(k - 1), threshold) === 'pull' && score(k - 1) > score(k)) return ranked.slice(0, k)
  }
  return []
}

/** The most Legends "Your Domains" lists under the bars. */
export const DOMAIN_PICKS_LIMIT = 6

/** The leading Domains and the Matches holding all of them, in fit order, after the headline. */
export function domainPicks(profile: Profile, matches: Match[]): DomainPicks {
  const domains = leadingDomains(profile)
  const holding = domains.length
    ? matches.slice(HEADLINE_MATCHES).filter((m) => domains.every((d) => m.legend.domains.includes(d)))
    : []
  return { domains, matches: holding.slice(0, DOMAIN_PICKS_LIMIT) }
}

/** The best-fitting Match among the Player's favourite champions that the page doesn't already show. */
export function favouritePick(matches: Match[], favouriteChampions: string[], shown: Legend[]): Match | null {
  const skip = new Set(shown.map((l) => l.id))
  return matches.find((m) => favouriteChampions.includes(m.legend.champion) && !skip.has(m.legend.id)) ?? null
}

/** A playstyle gap at least this big (one band) is worth telling the Player about. */
export const PLAYSTYLE_GAP_THRESHOLD = 2

export interface PlaystyleGap {
  axis: PlaystyleAxisId
  /** Build minus Profile. Positive means the Build sits higher, e.g. faster, than the Player. */
  gap: number
}

/** The playstyle Axes where a Build sits at least a band from the Player's shown scores, biggest first. */
export function playstyleGaps(profile: Profile, build: Build): PlaystyleGap[] {
  return PLAYSTYLE_AXIS_IDS.map((axis) => ({ axis, gap: round1(build.coordinates[axis] - profile[axis]) }))
    .filter((g) => Math.abs(g.gap) >= PLAYSTYLE_GAP_THRESHOLD)
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
}
