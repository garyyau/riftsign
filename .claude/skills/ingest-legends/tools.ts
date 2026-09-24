/**
 * Mechanical steps of the ingest-legends skill. Run from the repo root:
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts targets <id...|all>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts apply <workflow-output.json> <YYYY-MM-DD>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts check [id...]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { DOMAIN_ID, DOMAINS, PLAYSTYLE_AXIS_IDS, type PlaystyleAxisId } from '../../../src/lib/axes'
import { rankLegends } from '../../../src/lib/scoring'
import type { Archetype, Build, BuildCoordinates, Legend, Profile } from '../../../src/lib/types'
import { loadLegends } from '../../../scripts/lib/load-legends'

const DIR = path.resolve(import.meta.dirname, '../../../src/data/legends')
const file = (id: string) => path.join(DIR, `${id}.json`)
const read = (id: string): Legend => JSON.parse(readFileSync(file(id), 'utf8'))
const allIds = () => readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))

type Status = 'keep' | 'change' | 'new' | 'drop'
type Draft = Partial<Record<PlaystyleAxisId, number>> &
  Partial<Pick<Build, 'howItPlays' | 'whyYou' | 'guideUrls' | 'deckListUrl' | 'ratingNotes'>>
interface Proposal extends Draft {
  status: Status
  archetype: Archetype
  previousArchetype?: Archetype
}
interface Verdict {
  archetype: Archetype
  status: Status
  accept: boolean
  reason: string
  revised?: Draft
}
interface Result {
  legend: { id: string }
  research: { starterDeck?: string | null; evidenceSummary: string; builds: Proposal[] } | null
  verdicts: Verdict[] | null
}

/** Workflow args for these Legends, read from their files so the current Builds are never typed by hand. */
function targets(ids: string[]) {
  const chosen = ids[0] === 'all' ? allIds() : ids
  const out = chosen.map((id) => {
    const l = read(id)
    return {
      id,
      name: l.name,
      champion: l.champion,
      domains: l.domains,
      mode: l.builds.length ? 'rerate' : 'new',
      builds: l.builds.map((b) => ({ archetype: b.archetype, ...pick(b.coordinates) })),
    }
  })
  console.log(JSON.stringify(out))
}

const pick = (c: Record<string, number>) => Object.fromEntries(PLAYSTYLE_AXIS_IDS.map((a) => [a, c[a]]))

function toBuild(legend: Legend, archetype: Archetype, d: Draft): Build {
  const missing = [...PLAYSTYLE_AXIS_IDS, 'howItPlays', 'whyYou', 'guideUrls', 'deckListUrl', 'ratingNotes'].filter(
    (k) => d[k as keyof Draft] === undefined,
  )
  if (missing.length) throw new Error(`${legend.id} ${archetype}: draft is missing ${missing.join(', ')}`)
  return {
    archetype,
    coordinates: pick(d as Record<string, number>) as BuildCoordinates,
    howItPlays: d.howItPlays!,
    whyYou: d.whyYou!,
    guideUrls: d.guideUrls!,
    deckListUrl: d.deckListUrl!,
    reviewed: false,
    ratingNotes: d.ratingNotes!,
  }
}

/** The single writer: applies every skeptic-accepted proposal, preferring the skeptic's revised draft. */
function apply(outputPath: string, today: string) {
  const raw = JSON.parse(readFileSync(outputPath, 'utf8'))
  const results: Result[] = (raw.result ?? raw).results
  for (const r of results) {
    const id = r.legend.id
    if (!r.research) {
      console.log(`${id}: NO RESULT (rerun this Legend)`)
      continue
    }
    const legend = read(id)
    const isNew = legend.builds.length === 0
    const lines: string[] = []
    for (const p of r.research.builds.filter((p) => p.status !== 'keep')) {
      const v = r.verdicts?.find((v) => v.archetype === p.archetype && v.status === p.status)
      if (!v?.accept) {
        lines.push(`  rejected ${p.status} ${p.archetype}: ${v?.reason ?? 'no verdict'}`)
        continue
      }
      const draft = { ...p, ...v.revised }
      const from = p.previousArchetype ?? p.archetype
      const at = legend.builds.findIndex((b) => b.archetype === from)
      if (p.status === 'new') legend.builds.push(toBuild(legend, p.archetype, draft))
      else if (at < 0) {
        lines.push(`  SKIPPED ${p.status} ${from}: no such Build in the file`)
        continue
      } else if (p.status === 'change') legend.builds[at] = toBuild(legend, p.archetype, draft)
      else if (legend.builds.length > 1) legend.builds.splice(at, 1)
      else {
        lines.push(`  SKIPPED drop ${from}: it is the last Build`)
        continue
      }
      lines.push(`  ${p.status} ${p.status === 'change' && from !== p.archetype ? `${from} -> ` : ''}${p.archetype}${v.revised ? ' (skeptic revised)' : ''}`)
    }
    if (isNew) {
      legend.ingestedAt = today
      if (legend.starterDeck === null && r.research.starterDeck) legend.starterDeck = r.research.starterDeck
    }
    if (lines.length || isNew) writeFileSync(file(id), JSON.stringify(legend, null, 2) + '\n')
    console.log(`${id}: ${lines.length ? '\n' + lines.join('\n') : 'no change'}`)
  }
}

/**
 * Signals, not gates. Self-match: a Player sitting exactly on a Build should get that Legend
 * and Build back first. Centroid: a Build nearer another Archetype's mean position than its own
 * label's may be mislabelled or misplaced.
 */
function check(ids: string[]) {
  const pool = loadLegends(true).map((l) => ({ ...l, builds: l.builds.map((b) => ({ ...b, reviewed: true })) }))
  const scope = new Set(ids.length ? ids : pool.map((l) => l.id))
  const points = pool.flatMap((l) => l.builds.map((b) => ({ l, b, v: PLAYSTYLE_AXIS_IDS.map((a) => b.coordinates[a]) })))
  const dist = (a: number[], b: number[]) => Math.hypot(...a.map((x, i) => x - b[i]))
  let flags = 0
  for (const { l, b, v } of points.filter((p) => scope.has(p.l.id))) {
    // A Player on the Build who loves its Legend's two Domains and has no feeling about the rest.
    const player = { ...b.coordinates, ...Object.fromEntries(DOMAINS.map((d) => [DOMAIN_ID[d], l.domains.includes(d) ? 10 : 5])) } as Profile
    const [top] = rankLegends(player, pool)
    if (top.legend.id !== l.id || top.build.archetype !== b.archetype) {
      flags++
      console.log(`self-match  ${l.id} ${b.archetype}: top Match is ${top.legend.id} ${top.build.archetype}`)
    }
    const means = new Map<Archetype, number[][]>()
    for (const p of points) if (p.b !== b) means.set(p.b.archetype, [...(means.get(p.b.archetype) ?? []), p.v])
    const nearest = [...means]
      .map(([a, vs]) => ({ a, d: dist(v, PLAYSTYLE_AXIS_IDS.map((_, i) => vs.reduce((s, x) => s + x[i], 0) / vs.length)) }))
      .sort((x, y) => x.d - y.d)
    if (nearest[0].a !== b.archetype) {
      flags++
      const own = nearest.find((n) => n.a === b.archetype)
      console.log(`centroid    ${l.id} ${b.archetype} ${v.join('/')}: nearer ${nearest[0].a} (${nearest[0].d.toFixed(1)}) than ${b.archetype} (${own?.d.toFixed(1)})`)
    }
  }
  console.log(`${flags} flag(s) across ${scope.size} Legend(s).`)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'targets') targets(rest)
else if (cmd === 'apply') apply(rest[0], rest[1])
else if (cmd === 'check') check(rest)
else console.error('usage: tools.ts targets <id...|all> | apply <output.json> <YYYY-MM-DD> | check [id...]')
