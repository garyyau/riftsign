/**
 * Mechanical steps of the ingest-legends skill. Run from the repo root:
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts targets <id...|all>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts apply <workflow-output.json> <YYYY-MM-DD>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts check [id...]
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts deck <piltoverarchive deck url | uuid>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts card <name>
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

interface PaCard {
  name: string
  type: string
  super: string | null
  description: string | null
  energy: number | null
  might: number | null
  power: number | null
  tags: string[] | null
}
interface PaEntry {
  quantity?: number
  card: PaCard
}
interface CodexCard {
  name: string
  classification: { type: string }
  attributes: { energy: number | null; might: number | null; power: number | null }
  text: { plain: string }
}

const PA_API = 'https://piltoverarchive.com/api/external/v1'
const getJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} from ${url}`)
  return res.json() as Promise<T>
}
const oneLine = (s: string | null | undefined) =>
  (s ?? '')
    .normalize('NFKC') // errata prefixes use mathematical bold letters
    .replace(/^Card Errata Text\s*[-–]\s*From .*?Card Errata:\s*/, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
/** Bracketed words that are cost icons, not keywords. */
const ICONS = new Set(['rune', 'fury', 'calm', 'mind', 'body', 'chaos', 'order', 'tap', 'might', 'energy', 'exhaust'])
const codexSearch = async (name: string) =>
  (await getJson<{ items: CodexCard[] }>(`https://api.riftcodex.com/cards/name?fuzzy=${encodeURIComponent(name)}`)).items

/**
 * Prints one deck as a rating sheet: every card with its cost and text, then the mechanical
 * counts the deck rubric starts from. Main deck plus the chosen Champion is the 40 the rubric scores.
 */
async function deck(ref: string) {
  const uuid = ref.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
  if (!uuid) throw new Error(`no deck uuid in "${ref}"`)
  const raw = await getJson<Record<string, unknown>>(`${PA_API}/decks/${uuid}?expand=cards`)
  const d = (raw.data ?? raw) as {
    name: string
    createdAt: string
    legend: { name: string; colors: { name: string }[] }
    expandedCards: Record<string, PaEntry[] | null>
  }
  const zone = (z: string) => d.expandedCards[z] ?? []
  const legendText = (await codexSearch(d.legend.name.replace(', ', ' - '))).find((c) => c.classification.type === 'Legend')
  const champs = zone('champions')
  const main = [...champs.map((e) => ({ ...e, quantity: 1 })), ...zone('maindeck')] as Required<PaEntry>[]
  const cost = (c: PaCard) => `${c.energy ?? 0}E${c.power ? ` ${c.power}P` : ''}`
  const n = (pred: (c: PaCard) => boolean) => main.reduce((s, e) => s + (pred(e.card) ? e.quantity : 0), 0)
  const total = n(() => true)
  const avg = (pred: (c: PaCard) => boolean) => {
    const k = n(pred)
    return k ? (main.reduce((s, e) => s + (pred(e.card) ? e.quantity * (e.card.energy ?? 0) : 0), 0) / k).toFixed(2) : '-'
  }
  const isUnit = (c: PaCard) => c.type === 'Unit'
  const has = (kw: string) => (c: PaCard) => new RegExp(`\\[${kw}`, 'i').test(c.description ?? '')

  const out: string[] = []
  out.push(`Deck: ${d.name} (${d.createdAt.slice(0, 10)})  https://piltoverarchive.com/decks/view/${uuid}`)
  out.push(`Legend: ${d.legend.name} [${d.legend.colors.map((c) => c.name).join('/')}]: ${oneLine(legendText?.text.plain) || '(text not found; run `card`)'}`)
  for (const e of champs) out.push(`Champion: ${e.card.name} (${cost(e.card)}, ${e.card.might} might): ${oneLine(e.card.description)}`)
  out.push(`Battlefields: ${zone('battlefields').map((e) => `${e.card.name}: ${oneLine(e.card.description)}`).join(' | ')}`)
  out.push(`Runes: ${zone('runes').map((e) => `${e.quantity} ${e.card.name}`).join(', ')}`)
  out.push('', `Main deck (${total} incl. Champion), by cost:`)
  for (const e of [...main].sort((a, b) => (a.card.energy ?? 0) - (b.card.energy ?? 0) || a.card.name.localeCompare(b.card.name))) {
    const c = e.card
    const stats = isUnit(c) ? `, ${c.might} might` : ''
    out.push(`  ${e.quantity}x ${c.name} [${c.super ? `${c.super} ` : ''}${c.type}, ${cost(c)}${stats}]: ${oneLine(c.description)}`)
  }
  const side = zone('sideboard')
  if (side.length) out.push('', `Sideboard (not scored): ${side.map((e) => `${e.quantity} ${e.card.name}`).join(', ')}`)

  const buckets = ['0-1', '2', '3', '4', '5', '6+'].map((label, i) => {
    const lo = i === 0 ? 0 : i + 1
    const hi = i === 0 ? 1 : i === 5 ? 99 : i + 1
    return `${label}: ${n((c) => (c.energy ?? 0) >= lo && (c.energy ?? 0) <= hi)}`
  })
  const types = [...new Set(main.map((e) => e.card.type))].map((t) => `${t} ${n((c) => c.type === t)}`)
  const keywords = new Map<string, number>()
  for (const e of main) {
    const found = [...(e.card.description ?? '').matchAll(/\[([A-Za-z][A-Za-z' -]*?)(?: \d+)?\]/g)].map((m) => m[1].toLowerCase())
    for (const k of new Set(found.filter((k) => !ICONS.has(k)))) keywords.set(k, (keywords.get(k) ?? 0) + e.quantity)
  }
  out.push('', 'Counts (copies, main deck incl. Champion):')
  out.push(`  Types: ${types.join(', ')}`)
  out.push(`  Average energy cost: all ${avg(() => true)}, units ${avg(isUnit)}, non-units ${avg((c) => !isUnit(c))}`)
  out.push(`  Energy curve: ${buckets.join(', ')}`)
  out.push(`  Units costing 2 or less: ${n((c) => isUnit(c) && (c.energy ?? 0) <= 2)}; cards costing 5+: ${n((c) => (c.energy ?? 0) >= 5)}`)
  out.push(`  Reaction cards: ${n(has('reaction'))}; Action cards: ${n(has('action'))}; Hidden cards: ${n(has('hidden'))}`)
  out.push(`  Keywords: ${[...keywords].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`)
  console.log(out.join('\n'))
}

/** Card text lookup for cards the rater doesn't know, e.g. from a set newer than the model. */
async function card(name: string) {
  const seen = new Set<string>()
  for (const c of await codexSearch(name)) {
    const base = c.name.replace(/\s*\(.*\)$/, '')
    if (seen.has(base)) continue
    seen.add(base)
    const a = c.attributes
    console.log(`${base} [${c.classification.type}, ${a.energy ?? 0}E${a.power ? ` ${a.power}P` : ''}${a.might ? `, ${a.might} might` : ''}]: ${oneLine(c.text.plain)}`)
    if (seen.size === 5) break
  }
  if (!seen.size) console.log(`No Riftcodex match for "${name}". Try the card's Piltover Archive page or a web search.`)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'targets') targets(rest)
else if (cmd === 'apply') apply(rest[0], rest[1])
else if (cmd === 'check') check(rest)
else if (cmd === 'deck') await deck(rest[0])
else if (cmd === 'card') await card(rest.join(' '))
else console.error('usage: tools.ts targets <id...|all> | apply <output.json> <YYYY-MM-DD> | check [id...] | deck <url|uuid> | card <name>')
