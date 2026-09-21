import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { validateLegend, type ValidationResult } from '../../src/lib/schemas'
import type { Legend } from '../../src/lib/types'

export const LEGEND_DIR = path.resolve(import.meta.dirname, '../../src/data/legends')

export interface LegendFile {
  file: string
  result: ValidationResult<Legend>
}

/** Every Legend JSON file with its validation result, in filename order. */
export function readLegendFiles(): LegendFile[] {
  return readdirSync(LEGEND_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((file) => ({ file, result: validateLegend(JSON.parse(readFileSync(path.join(LEGEND_DIR, file), 'utf8'))) }))
}

/** Only the Legends that validate; pass includeUnreviewed to keep drafts. */
export function loadLegends(includeUnreviewed = false): Legend[] {
  return readLegendFiles()
    .flatMap(({ result }) => (result.success ? [result.data] : []))
    .filter((l) => includeUnreviewed || l.reviewed)
}
