import { z } from 'zod'
import { DOMAINS, isDomainId, SCORE_IDS, type ScoreId } from './axes'
import { answersOf } from './scoring'
import { ARCHETYPES, MAX_BUILDS, SET_CODES, type Legend, type Question, type QuestionSet } from './types'

export const MIN_QUESTIONS_PER_SCORE = 3

const scoreId = z.enum(SCORE_IDS)
const playstyleScore = z.number().min(0).max(10)
const domain = z.enum(DOMAINS)

/** Strict, so a stored Domain coordinate is rejected: a Build's Domains come from its Legend. */
export const buildCoordinatesSchema = z.strictObject({
  pace: playstyleScore,
  stance: playstyleScore,
  complexity: playstyleScore,
  variance: playstyleScore,
})

export const buildSchema = z.object({
  archetype: z.enum(ARCHETYPES),
  coordinates: buildCoordinatesSchema,
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

const scoreMove = z.object({ axis: scoreId, weight: z.number() })
const scoreLoading = z.object({ axis: scoreId, reverse: z.boolean() })
const answerSchema = z.object({ id: z.string().min(1), text: z.string().min(1), moves: z.array(scoreMove) })

const questionBase = {
  id: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case id'),
  eyebrow: z.string().min(1),
  prompt: z.string().min(1),
  loads: z.array(scoreLoading).min(1),
}

export const questionSchema = z.discriminatedUnion('kind', [
  z
    .object({ ...questionBase, kind: z.literal('scenario'), answers: z.array(answerSchema).min(2).max(4), scale: z.boolean().optional() })
    .refine((q) => !q.scale || q.answers.length === 2, { message: 'a scale scenario needs exactly two Answers', path: ['answers'] }),
  z.object({ ...questionBase, kind: z.literal('statement'), agreeMoves: z.array(scoreMove).min(1) }),
])

export const questionSetSchema = z.object({
  version: z.string().regex(/^[A-Za-z0-9-]+$/),
  questions: z.array(questionSchema).min(1),
})

export type ValidationResult<T> = { success: true; data: T } | { success: false; issues: string[] }

const formatZodIssues = (error: z.ZodError) =>
  error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)

export function validateLegend(raw: unknown): ValidationResult<Legend> {
  const parsed = legendSchema.safeParse(raw)
  return parsed.success ? { success: true, data: parsed.data } : { success: false, issues: formatZodIssues(parsed.error) }
}

/**
 * Reverse keying has to be real, not just declared. For a statement, agreeing must move the score
 * down when reverse is true and up when it is false. For a scenario, reverse means the first
 * listed (most "obvious") Answer moves the score down. A scale has only its two poles, so its
 * keying is checked both ways and the poles must pull the score in opposite directions.
 */
function reverseKeyingIssue(question: Question, id: ScoreId, reverse: boolean): string | null {
  const weightOf = (moves: { axis: ScoreId; weight: number }[]) => moves.find((m) => m.axis === id)?.weight ?? 0
  if (question.kind === 'statement') {
    const agree = weightOf(question.agreeMoves)
    if (reverse && agree >= 0) return `marked reverse on ${id} but agreeing moves it up`
    if (!reverse && agree <= 0) return `not marked reverse on ${id} but agreeing moves it down`
    return null
  }
  const first = weightOf(question.answers[0].moves)
  if (reverse && first >= 0) return `marked reverse on ${id} but its first Answer does not move it down`
  if (!question.scale) return null
  if (!reverse && first <= 0) return `not marked reverse on ${id} but its first pole does not move it up`
  if (Math.sign(weightOf(question.answers[1].moves)) !== -Math.sign(first)) {
    return `scale poles must move ${id} in opposite directions`
  }
  return null
}

/**
 * Every score needs MIN_QUESTIONS_PER_SCORE loads, one of them reverse-keyed. A Domain also needs
 * a forward-keyed load. In a zero-sum Domain choice the first Answer raises one Domain and lowers
 * the other, so every such item is reverse-keyed for one of its two Domains by construction, and
 * "has a reverse-keyed load" only means "is not always listed first". A Domain always listed
 * second would lose to first-option bias every time, so a Domain needs both directions.
 */
export function validateQuestionSet(raw: unknown): ValidationResult<QuestionSet> {
  const parsed = questionSetSchema.safeParse(raw)
  if (!parsed.success) return { success: false, issues: formatZodIssues(parsed.error) }
  const set = parsed.data
  const issues: string[] = []

  const seenIds = new Set<string>()
  const loading = Object.fromEntries(SCORE_IDS.map((id) => [id, { count: 0, reverse: 0 }])) as Record<
    ScoreId,
    { count: number; reverse: number }
  >

  for (const question of set.questions) {
    if (seenIds.has(question.id)) issues.push(`${question.id}: duplicate Question id`)
    seenIds.add(question.id)

    const answers = answersOf(question)
    const answerIds = new Set(answers.map((a) => a.id))
    if (answerIds.size !== answers.length) issues.push(`${question.id}: duplicate Answer id`)

    const moved = new Set(answers.flatMap((a) => a.moves.map((m) => m.axis)))
    const seenLoads = new Set<ScoreId>()
    for (const load of question.loads) {
      if (!moved.has(load.axis)) {
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

  for (const id of SCORE_IDS) {
    const { count, reverse } = loading[id]
    if (count < MIN_QUESTIONS_PER_SCORE) {
      const noun = count === 1 ? 'Question' : 'Questions'
      issues.push(`${id}: loaded by ${count} ${noun}, needs at least ${MIN_QUESTIONS_PER_SCORE}`)
    }
    if (reverse === 0) issues.push(`${id}: no reverse-keyed Question`)
    if (isDomainId(id) && count > 0 && reverse === count) issues.push(`${id}: no forward-keyed Question`)
  }

  return issues.length ? { success: false, issues } : { success: true, data: set }
}
