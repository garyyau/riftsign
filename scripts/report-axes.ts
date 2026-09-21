/**
 * Informational report (not a gate): inter-Axis correlation across reviewed Legend coordinates,
 * and how many Legends sit inside a central radius of normalized Axis space. Run `pnpm report`.
 * Pass --all to include unreviewed drafts.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { AXIS_IDS, normalize, type AxisId } from '../src/lib/axes'
import { validateLegend } from '../src/lib/schemas'
import type { Legend } from '../src/lib/types'

const includeAll = process.argv.includes('--all')
const legendDir = path.resolve(import.meta.dirname, '../src/data/legends')
const legends: Legend[] = readdirSync(legendDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => validateLegend(JSON.parse(readFileSync(path.join(legendDir, f), 'utf8'))))
  .flatMap((r) => (r.success ? [r.data] : []))
  .filter((l) => includeAll || l.reviewed)

if (legends.length < 2) {
  console.log(`Only ${legends.length} Legend(s) in scope; nothing to correlate. Try --all.`)
  process.exit(0)
}

const columns = Object.fromEntries(
  AXIS_IDS.map((axis) => [axis, legends.map((l) => normalize(axis, l.coordinates[axis]))]),
) as Record<AxisId, number[]>

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const pearson = (xs: number[], ys: number[]) => {
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    dx += (xs[i] - mx) ** 2
    dy += (ys[i] - my) ** 2
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy)
}

console.log(`Inter-Axis correlation across ${legends.length} Legend(s)${includeAll ? ' (including unreviewed)' : ''}:\n`)
const pad = (s: string, n = 12) => s.padStart(n)
console.log(pad('') + AXIS_IDS.map((a) => pad(a)).join(''))
for (const a of AXIS_IDS) {
  console.log(pad(a) + AXIS_IDS.map((b) => pad(pearson(columns[a], columns[b]).toFixed(2))).join(''))
}
const strong = AXIS_IDS.flatMap((a, i) =>
  AXIS_IDS.slice(i + 1)
    .map((b) => ({ a, b, r: pearson(columns[a], columns[b]) }))
    .filter(({ r }) => Math.abs(r) >= 0.7),
)
console.log(
  strong.length
    ? `\nStrongly correlated pairs (|r| >= 0.7): ${strong.map(({ a, b, r }) => `${a}/${b} ${r.toFixed(2)}`).join(', ')}`
    : '\nNo Axis pair correlates at |r| >= 0.7.',
)

const CENTRAL_RADIUS = 0.25
const centre = AXIS_IDS.map(() => 0.5)
const central = legends.filter((l) => {
  const d = Math.sqrt(AXIS_IDS.reduce((sum, axis, i) => sum + (normalize(axis, l.coordinates[axis]) - centre[i]) ** 2, 0))
  return d <= CENTRAL_RADIUS
})
console.log(
  `\n${central.length} of ${legends.length} Legends (${Math.round((100 * central.length) / legends.length)}%) sit within ${CENTRAL_RADIUS} of the centre of normalized Axis space.`,
)
if (central.length) console.log(`  ${central.map((l) => l.name).join(', ')}`)
