import { AXES, AXIS_IDS, DOMAIN_AXIS_IDS, normalize, type AxisId, type Domain, type DomainAxisId } from './axes'
import type { Answer, Answers, Archetype, Build, DomainLean, Legend, Match, Profile, Question, QuestionSet } from './types'

export const STATEMENT_POINTS = [
  { id: 'strongly-disagree', text: 'Strongly disagree', factor: -1 },
  { id: 'disagree', text: 'Disagree', factor: -0.5 },
  { id: 'neutral', text: 'Neutral', factor: 0 },
  { id: 'agree', text: 'Agree', factor: 0.5 },
  { id: 'strongly-agree', text: 'Strongly agree', factor: 1 },
] as const

/** Every Question presents as a list of Answers; statements expand to five points. */
export function answersOf(question: Question): Answer[] {
  if (question.kind === 'scenario') return question.answers
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


/** Per-Axis distance weights. All 1 by default; adjust here after an audit, nowhere else. */
export const AXIS_WEIGHTS: Record<AxisId, number> = {
  pace: 1,
  stance: 1,
  complexity: 1,
  variance: 1,
  'fury-calm': 1,
  'mind-body': 1,
  'chaos-order': 1,
}

/** Fit points added to every Legend of a Champion the Player named as a favourite. Kept small: a nudge, not a thumb on the scale. */
export const FAVOURITE_CHAMPION_BONUS = 3

const MAX_DISTANCE = Math.sqrt(AXIS_IDS.reduce((sum, axis) => sum + AXIS_WEIGHTS[axis], 0))

function distance(a: Profile, b: Profile): number {
  let sum = 0
  for (const axis of AXIS_IDS) {
    const d = normalize(axis, a[axis]) - normalize(axis, b[axis])
    sum += AXIS_WEIGHTS[axis] * d * d
  }
  return Math.sqrt(sum)
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
      const scored = reviewedBuilds(legend).map((build) => ({ build, d: distance(profile, build.coordinates) }))
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
 * The two Domain Axes the Profile leans on hardest, the Domains they point to, and the
 * reviewed Legends holding exactly that Domain pair (minus any already in the top three).
 */
export function domainLean(profile: Profile, pool: Legend[], exclude: Legend[] = []): DomainLean {
  const [a, b] = [...DOMAIN_AXIS_IDS].sort((x, y) => Math.abs(profile[y]) - Math.abs(profile[x])) as [
    DomainAxisId,
    DomainAxisId,
  ]
  const poleOf = (axis: DomainAxisId): Domain[] => {
    if (profile[axis] === 0) return []
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
