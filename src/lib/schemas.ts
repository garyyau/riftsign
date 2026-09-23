import { z } from 'zod'
import { AXIS_IDS, DOMAIN_AXIS_IDS, DOMAIN_POLES, DOMAINS, type AxisId, type Domain, type DomainAxisId } from './axes'
import { answersOf } from './scoring'
import { ARCHETYPES, MAX_BUILDS, SET_CODES, type Legend, type Question, type QuestionSet } from './types'

export const MIN_QUESTIONS_PER_AXIS = 3

const axisId = z.enum(AXIS_IDS)
const domain = z.enum(DOMAINS)

const playstyleScore = z.number().min(0).max(10)
const domainScore = z.number().min(-5).max(5)

export const profileSchema = z.object({
  pace: playstyleScore,
  stance: playstyleScore,
  complexity: playstyleScore,
  variance: playstyleScore,
  'fury-calm': domainScore,
  'mind-body': domainScore,
  'chaos-order': domainScore,
})

export const buildSchema = z.object({
  archetype: z.enum(ARCHETYPES),
  coordinates: profileSchema,
  howItPlays: z.string().min(1),
  whyYou: z.string().min(1),
  guideUrls: z.array(z.url()).min(1, 'at least one guide URL grounds the rating'),
  deckListUrl: z.url(),
  reviewed: z.boolean(),
  ratingNotes: z.string(),
})

export const legendSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case id'),
  name: z.string().min(1),
  champion: z.string().min(1),
  domains: z.tuple([domain, domain]).refine(([a, b]) => a !== b, 'domains must differ'),
  set: z.enum(SET_CODES),
  starterDeck: z.string().min(1).nullable(),
  cardImage: z.string().min(1),
  ingestedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  builds: z
    .array(buildSchema)
    .min(1)
    .max(MAX_BUILDS)
    .refine((bs) => new Set(bs.map((b) => b.archetype)).size === bs.length, 'each Build needs a different archetype'),
})

const axisMove = z.object({ axis: axisId, weight: z.number() })
const axisLoading = z.object({ axis: axisId, reverse: z.boolean() })
const answerSchema = z.object({ id: z.string().min(1), text: z.string().min(1), moves: z.array(axisMove).min(1) })

const questionBase = {
  id: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case id'),
  eyebrow: z.string().min(1),
  prompt: z.string().min(1),
  loads: z.array(axisLoading).min(1),
}

export const questionSchema = z.discriminatedUnion('kind', [
  z.object({ ...questionBase, kind: z.literal('scenario'), answers: z.array(answerSchema).min(2).max(4) }),
  z.object({ ...questionBase, kind: z.literal('statement'), agreeMoves: z.array(axisMove).min(1) }),
])

export const questionSetSchema = z.object({
  version: z.string().regex(/^[A-Za-z0-9-]+$/),
  questions: z.array(questionSchema).min(1),
})

export type ValidationResult<T> = { success: true; data: T } | { success: false; issues: string[] }

const formatZodIssues = (error: z.ZodError) =>
  error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)

/** Domain Axis coordinates implied by a Legend's two Domains. The only allowed source for them. */
export function domainCoordinates(domains: readonly Domain[]): Record<DomainAxisId, number> {
  const out = Object.fromEntries(DOMAIN_AXIS_IDS.map((id) => [id, 0])) as Record<DomainAxisId, number>
  for (const d of domains) {
    const { axis, value } = DOMAIN_POLES[d]
    out[axis] += value
  }
  return out
}

export function validateLegend(raw: unknown): ValidationResult<Legend> {
  const parsed = legendSchema.safeParse(raw)
  if (!parsed.success) return { success: false, issues: formatZodIssues(parsed.error) }
  const legend = parsed.data
  const issues: string[] = []
  const expected = domainCoordinates(legend.domains)
  legend.builds.forEach((build, i) => {
    for (const axis of DOMAIN_AXIS_IDS) {
      if (build.coordinates[axis] !== expected[axis]) {
        issues.push(
          `builds.${i}.coordinates.${axis}: stored ${build.coordinates[axis]} but Domains ${legend.domains.join('/')} expected ${expected[axis]}`,
        )
      }
    }
  })
  return issues.length ? { success: false, issues } : { success: true, data: legend }
}

/**
 * Reverse keying has to be real, not just declared. For a statement, agreeing must move the Axis
 * low when reverse is true and high when it is false. For a scenario, reverse means the first
 * listed (most "obvious") Answer moves the Axis low.
 */
function reverseKeyingIssue(question: Question, axis: AxisId, reverse: boolean): string | null {
  const weightOf = (moves: { axis: AxisId; weight: number }[]) => moves.find((m) => m.axis === axis)?.weight ?? 0
  if (question.kind === 'statement') {
    const agree = weightOf(question.agreeMoves)
    if (reverse && agree >= 0) return `marked reverse on ${axis} but agreeing moves it high`
    if (!reverse && agree <= 0) return `not marked reverse on ${axis} but agreeing moves it low`
    return null
  }
  const first = weightOf(question.answers[0].moves)
  if (reverse && first >= 0) return `marked reverse on ${axis} but its first Answer does not move it low`
  return null
}

export function validateQuestionSet(raw: unknown): ValidationResult<QuestionSet> {
  const parsed = questionSetSchema.safeParse(raw)
  if (!parsed.success) return { success: false, issues: formatZodIssues(parsed.error) }
  const set = parsed.data
  const issues: string[] = []

  const seenIds = new Set<string>()
  const loading = Object.fromEntries(AXIS_IDS.map((id) => [id, { count: 0, reverse: 0 }])) as Record<
    AxisId,
    { count: number; reverse: number }
  >

  for (const question of set.questions) {
    if (seenIds.has(question.id)) issues.push(`${question.id}: duplicate Question id`)
    seenIds.add(question.id)

    const answers = answersOf(question)
    const answerIds = new Set(answers.map((a) => a.id))
    if (answerIds.size !== answers.length) issues.push(`${question.id}: duplicate Answer id`)

    const movedAxes = new Set(answers.flatMap((a) => a.moves.map((m) => m.axis)))
    const seenLoads = new Set<AxisId>()
    for (const load of question.loads) {
      if (!movedAxes.has(load.axis)) {
        issues.push(`${question.id}: claims to load ${load.axis} but no Answer moves it`)
        continue
      }
      if (seenLoads.has(load.axis)) {
        issues.push(`${question.id}: lists ${load.axis} twice in loads`)
        continue
      }
      seenLoads.add(load.axis)
      const keyingIssue = reverseKeyingIssue(question, load.axis, load.reverse)
      if (keyingIssue) issues.push(`${question.id}: ${keyingIssue}`)
      loading[load.axis].count += 1
      if (load.reverse) loading[load.axis].reverse += 1
    }
  }

  for (const axis of AXIS_IDS) {
    const { count, reverse } = loading[axis]
    if (count < MIN_QUESTIONS_PER_AXIS) {
      const noun = count === 1 ? 'Question' : 'Questions'
      issues.push(`${axis}: loaded by ${count} ${noun}, needs at least ${MIN_QUESTIONS_PER_AXIS}`)
    }
    if (reverse === 0) issues.push(`${axis}: no reverse-keyed Question`)
  }

  return issues.length ? { success: false, issues } : { success: true, data: set }
}
