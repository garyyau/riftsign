/**
 * One-off migration for quiz v3 (ADR 0005): a Build's coordinates hold only the four playstyle
 * Axes, and a Legend's Domains come from `legend.domains`. Drops the three stored Domain
 * coordinates from every Legend file and leaves everything else as it was. Safe to re-run.
 * Run `pnpm exec tsx scripts/migrate-drop-domain-coordinates.ts`.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { LEGEND_DIR } from './lib/load-legends'

const DROPPED = ['fury-calm', 'mind-body', 'chaos-order']

let changed = 0
for (const file of readdirSync(LEGEND_DIR).filter((f) => f.endsWith('.json'))) {
  const full = path.join(LEGEND_DIR, file)
  const before = readFileSync(full, 'utf8')
  const legend = JSON.parse(before) as { builds: { coordinates: Record<string, number> }[] }
  for (const build of legend.builds) for (const key of DROPPED) delete build.coordinates[key]
  const after = JSON.stringify(legend, null, 2) + '\n'
  if (after !== before) {
    writeFileSync(full, after)
    changed++
  }
}
console.log(`Dropped Domain coordinates from ${changed} Legend file(s) in ${LEGEND_DIR}.`)
