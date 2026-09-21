import { validateLegend, validateQuestionSet } from '@/lib/schemas'
import type { Legend, QuestionSet } from '@/lib/types'
import rawQuestions from './questions.json'

const rawLegends = import.meta.glob('./legends/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

function fail(where: string, issues: string[]): never {
  throw new Error(`${where} failed validation:\n  ${issues.join('\n  ')}`)
}

const questionResult = validateQuestionSet(rawQuestions)
if (!questionResult.success) fail('src/data/questions.json', questionResult.issues)

/** The committed Question set, validated on import so a bad edit fails the build. */
export const QUESTION_SET: QuestionSet = questionResult.data

/** Every committed Legend, reviewed or not. The site only ranks reviewed ones. */
export const ALL_LEGENDS: Legend[] = Object.entries(rawLegends)
  .map(([file, raw]) => {
    const result = validateLegend(raw)
    if (!result.success) fail(`src/data/${file.replace('./', '')}`, result.issues)
    return result.data
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export const LEGENDS: Legend[] = ALL_LEGENDS.filter((l) => l.reviewed)

/** Champion names for the optional favourites Question, drawn from the reviewed pool. */
export const CHAMPIONS: string[] = [...new Set(LEGENDS.map((l) => l.champion))].sort()
