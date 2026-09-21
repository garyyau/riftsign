/**
 * Build gate: every Question and Legend file must pass its schema and the cross-checks
 * (per-Axis Question counts, reverse keying, Domain coordinate consistency).
 * Exits non-zero with every issue listed.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { validateLegend, validateQuestionSet } from '../src/lib/schemas'

const dataDir = path.resolve(import.meta.dirname, '../src/data')
const failures: string[] = []

const questions = JSON.parse(readFileSync(path.join(dataDir, 'questions.json'), 'utf8'))
const questionResult = validateQuestionSet(questions)
if (!questionResult.success) failures.push(...questionResult.issues.map((i) => `questions.json: ${i}`))

const legendDir = path.join(dataDir, 'legends')
const legendFiles = readdirSync(legendDir).filter((f) => f.endsWith('.json'))
let reviewed = 0
for (const file of legendFiles) {
  const raw: unknown = JSON.parse(readFileSync(path.join(legendDir, file), 'utf8'))
  const result = validateLegend(raw)
  if (!result.success) failures.push(...result.issues.map((i) => `legends/${file}: ${i}`))
  else {
    if (result.data.reviewed) reviewed += 1
    if (`${result.data.id}.json` !== file) failures.push(`legends/${file}: id "${result.data.id}" does not match filename`)
  }
}

if (failures.length) {
  console.error(`Data validation failed with ${failures.length} issue(s):`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log(
  `Data OK: ${questionResult.success ? questionResult.data.questions.length : 0} Questions, ${legendFiles.length} Legends (${reviewed} reviewed).`,
)
