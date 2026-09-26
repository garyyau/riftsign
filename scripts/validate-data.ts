/**
 * Build gate: every Question and Legend file must pass its schema and the cross-checks
 * (per-score Question counts, reverse keying, no Domain coordinates on Builds, and a portrait crop
 * for every Legend in scripts/portrait-crops.json).
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

const crops: Record<string, unknown> = JSON.parse(readFileSync(path.resolve(import.meta.dirname, 'portrait-crops.json'), 'utf8'))

const legendFiles = readLegendFiles()
let reviewed = 0
let builds = 0
let reviewedBuildCount = 0
for (const { file, result } of legendFiles) {
  if (!result.success) failures.push(...result.issues.map((i) => `legends/${file}: ${i}`))
  else {
    const done = result.data.builds.filter((b) => b.reviewed).length
    if (done) reviewed += 1
    builds += result.data.builds.length
    reviewedBuildCount += done
    if (`${result.data.id}.json` !== file) failures.push(`legends/${file}: id "${result.data.id}" does not match filename`)
    if (!(result.data.id in crops)) failures.push(`legends/${file}: no portrait crop in scripts/portrait-crops.json`)
  }
}

// The site ranks reviewed Builds only, so with none it would deploy a quiz that matches nobody.
if (legendFiles.length && !reviewedBuildCount) failures.push('no Build is reviewed: the site would have no Legends to match. Approve Builds before deploying.')

if (failures.length) {
  console.error(`Data validation failed with ${failures.length} issue(s):`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
const questionCount = questionResult.success ? questionResult.data.questions.length : 0
console.log(
  `Data OK: ${questionCount} Questions, ${legendFiles.length} Legends (${reviewed} with a reviewed Build), ${builds} Builds (${reviewedBuildCount} reviewed).`,
)
