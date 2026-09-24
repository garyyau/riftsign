import {
  AXES,
  AXIS_IDS,
  DOMAIN_AXIS_IDS,
  DOMAIN_POLES,
  normalize,
  PLAYSTYLE_AXIS_IDS,
  type AxisId,
  type Domain,
  type DomainAxisId,
  type PlaystyleAxisId,
} from './axes'
import type { Answer, Answers, Archetype, Build, DomainLean, Legend, Match, Profile, Question, QuestionSet } from './types'

export const STATEMENT_POINTS = [
  { id: 'strongly-disagree', text: 'Strongly disagree', factor: -1 },
  { id: 'disagree', text: 'Disagree', factor: -0.5 },
  { id: 'neutral', text: 'Neutral', factor: 0 },
  { id: 'agree', text: 'Agree', factor: 0.5 },
  { id: 'strongly-agree', text: 'Strongly agree', factor: 1 },
] as const

/** A scale scenario's two poles expand to four points: strong and leaning on each side. */
export const SCALE_POINTS = [
  { pole: 0, strength: 'strong', factor: 1 },
  { pole: 0, strength: 'leaning', factor: 0.5 },
  { pole: 1, strength: 'leaning', factor: 0.5 },
  { pole: 1, strength: 'strong', factor: 1 },
] as const

/**
 * Every Question presents as a list of Answers. Statements expand to five points and scale
 * scenarios to four. A scale's strong points keep the pole Answer's id, so stored Answers survive.
 */
export function answersOf(question: Question): Answer[] {
  if (question.kind === 'scenario') {
    if (!question.scale) return question.answers
    return SCALE_POINTS.map((p) => {
      const pole = question.answers[p.pole]
      return {
        id: p.strength === 'strong' ? pole.id : `${pole.id}-leaning`,
        text: pole.text,
        moves: pole.moves.map((m) => ({ axis: m.axis, weight: m.weight * p.factor })),
      }
    })
  }
  return STATEMENT_POINTS.map((p) => ({
    id: p.id,
    text: p.text,
    moves: question.agreeMoves.map((m) => ({ axis: m.axis, weight: m.weight * p.factor })),
  }))
}

type Extremes = Record<AxisId, { positive: number; negative: number }>

/** The furthest each Axis can be pushed in either direction by this Question set. */
function extremes(set: QuestionSet): Extremes {
  const out = Object.fromEntries(AXIS_IDS.map((id) => [id, { positive: 0, negative: 0 }])) as Extremes
  for (const question of set.questions) {
    const perAxis: Partial<Record<AxisId, { positive: number; negative: number }>> = {}
    for (const answer of answersOf(question)) {
      for (const move of answer.moves) {
        const slot = (perAxis[move.axis] ??= { positive: 0, negative: 0 })
        slot.positive = Math.max(slot.positive, move.weight)
        slot.negative = Math.min(slot.negative, move.weight)
      }
    }
    for (const [axis, slot] of Object.entries(perAxis) as [AxisId, { positive: number; negative: number }][]) {
      out[axis].positive += slot.positive
      out[axis].negative += slot.negative
    }
  }
  return out
}

// The trailing + 0 turns -0 into 0 so a Domain score never renders as "-0".
const round1 = (n: number) => Math.round(n * 10) / 10 + 0

export function computeProfile(set: QuestionSet, answers: Answers): Profile {
  const raw = Object.fromEntries(AXIS_IDS.map((id) => [id, 0])) as Record<AxisId, number>
  for (const question of set.questions) {
    const chosen = answersOf(question).find((a) => a.id === answers[question.id])
    for (const move of chosen?.moves ?? []) raw[move.axis] += move.weight
  }
  const limits = extremes(set)
  const profile = {} as Profile
  for (const axis of AXIS_IDS) {
    const { min, max } = AXES[axis]
    const mid = (min + max) / 2
    const half = (max - min) / 2
    const value = raw[axis]
    const reach = value >= 0 ? limits[axis].positive : -limits[axis].negative
    profile[axis] = reach === 0 ? mid : round1(mid + (value / reach) * half)
  }
  return profile
}


/**
 * Distance weights (ADR 0004). Each playstyle Axis adds its normalised squared gap times its
 * weight; the Domain term adds DOMAIN_WEIGHT times the Legend's two Domain costs. Domain weighs
 * less so playstyle leads the Match. Adjust here after an audit (`pnpm simulate`), nowhere else.
 */
export const PLAYSTYLE_WEIGHTS: Record<PlaystyleAxisId, number> = { pace: 1, stance: 1, complexity: 1, variance: 1 }
export const DOMAIN_WEIGHT = 0.5

/** Fit points added to every Legend of a Champion the Player named as a favourite. A tie-break between close Matches, too small to reorder clear ones. */
export const FAVOURITE_CHAMPION_BONUS = 1

/** A Domain's cost when the Player's affinity for it is 0 (their score on its Axis is 0). */
const NEUTRAL_DOMAIN_COST = 0.25

// Both Domain costs at their maximum of 1 is the furthest a Profile can sit from a Legend.
const MAX_DISTANCE = Math.sqrt(PLAYSTYLE_AXIS_IDS.reduce((sum, axis) => sum + PLAYSTYLE_WEIGHTS[axis], 0) + 2 * DOMAIN_WEIGHT)

/**
 * How far the Player is from one Domain. Affinity runs from -1 (the Profile sits on the opposite
 * pole) to 1 (on this Domain's pole); the cost falls from 1 through 0.25 at neutral to 0.
 */
function domainCost(profile: Profile, domain: Domain): number {
  const { axis, value } = DOMAIN_POLES[domain]
  const affinity = profile[axis] / value
  return ((1 - affinity) / 2) ** 2
}

/**
 * The Domain part of the distance, from the Player's affinity for each of the Legend's two
 * Domains. Domains the Legend doesn't hold add nothing, so a fully neutral Player pays the same
 * for every Legend. A Legend holding both Domains of one Axis plays whichever the Player prefers,
 * so it takes the nearer Domain's cost and counts the other as neutral.
 */
function domainTerm(profile: Profile, legend: Legend): number {
  const [a, b] = legend.domains.map((d) => domainCost(profile, d))
  const oppositePair = DOMAIN_POLES[legend.domains[0]].axis === DOMAIN_POLES[legend.domains[1]].axis
  return DOMAIN_WEIGHT * (oppositePair ? Math.min(a, b) + NEUTRAL_DOMAIN_COST : a + b)
}

function playstyleTerm(profile: Profile, build: Build): number {
  let sum = 0
  for (const axis of PLAYSTYLE_AXIS_IDS) {
    const d = normalize(axis, profile[axis]) - normalize(axis, build.coordinates[axis])
    sum += PLAYSTYLE_WEIGHTS[axis] * d * d
  }
  return sum
}

export interface RankOptions {
  favouriteChampions?: string[]
}

/** Only reviewed Builds can appear in a Match. A Legend with none is not in the pool. */
export const reviewedBuilds = (legend: Legend): Build[] => legend.builds.filter((b) => b.reviewed)

/** One Match per Legend, scored on whichever of its reviewed Builds sits closest to the Profile. */
export function rankLegends(profile: Profile, pool: Legend[], options: RankOptions = {}): Match[] {
  const favourites = new Set(options.favouriteChampions ?? [])
  return pool
    .flatMap((legend) => {
      const domain = domainTerm(profile, legend)
      const scored = reviewedBuilds(legend).map((build) => ({ build, d: Math.sqrt(playstyleTerm(profile, build) + domain) }))
      if (!scored.length) return []
      const { build, d } = scored.reduce((best, s) => (s.d < best.d ? s : best))
      const bonus = favourites.has(legend.champion) ? FAVOURITE_CHAMPION_BONUS : 0
      return [{ legend, build, score: Math.min(100, (1 - d / MAX_DISTANCE) * 100 + bonus) }]
    })
    .sort((a, b) => b.score - a.score || a.legend.name.localeCompare(b.legend.name))
    .map(({ legend, build, score }) => ({ legend, build, fit: Math.round(score) }))
}

/** Top two Matches within this many fit points of each other count as a tie for the headline. */
export const ARCHETYPE_TIE_MARGIN = 3

/**
 * Top two Matches within this many fit points of each other are called a close call on the
 * result page. 0 means the same shown fit, which `pnpm simulate` puts at about one Player in
 * six; 1 would fire for over 40%. Retune with the simulation, separately from the tie margin.
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

/** A Domain Axis names a Domain in the lean only when the Profile sits at least this far from 0 on it. */
export const DOMAIN_LEAN_THRESHOLD = 2.5

/**
 * The two Domain Axes the Profile leans on hardest, the Domains they point to past the
 * threshold, and the reviewed Legends holding those Domains (minus any already in the top three).
 */
export function domainLean(profile: Profile, pool: Legend[], exclude: Legend[] = []): DomainLean {
  const [a, b] = [...DOMAIN_AXIS_IDS].sort((x, y) => Math.abs(profile[y]) - Math.abs(profile[x])) as [
    DomainAxisId,
    DomainAxisId,
  ]
  const poleOf = (axis: DomainAxisId): Domain[] => {
    if (Math.abs(profile[axis]) < DOMAIN_LEAN_THRESHOLD) return []
    return [(profile[axis] < 0 ? AXES[axis].lowLabel : AXES[axis].highLabel) as Domain]
  }
  const domains = [...poleOf(a), ...poleOf(b)]
  const excluded = new Set(exclude.map((l) => l.id))
  const legends =
    domains.length === 0
      ? []
      : pool.filter((l) => reviewedBuilds(l).length > 0 && !excluded.has(l.id) && domains.every((d) => l.domains.includes(d)))
  return { axes: [a, b], domains, legends }
}
