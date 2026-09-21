/**
 * Build gate: every Question and Legend file must pass its schema and the cross-checks
 * (per-Axis Question counts, reverse keying, Domain coordinate consistency).
 * Exits non-zero with every issue listed.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { validateQuestionSet } from '../src/lib/schemas'
import { readLegendFiles } from './lib/load-legends'

const failures: string[] = []

const questions = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../src/data/questions.json'), 'utf8'))
const questionResult = validateQuestionSet(questions)
if (!questionResult.success) failures.push(...questionResult.issues.map((i) => `questions.json: ${i}`))

const legendFiles = readLegendFiles()
let reviewed = 0
for (const { file, result } of legendFiles) {
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
const questionCount = questionResult.success ? questionResult.data.questions.length : 0
console.log(`Data OK: ${questionCount} Questions, ${legendFiles.length} Legends (${reviewed} reviewed).`)
