/**
 * Mechanical steps of the ingest-legends skill. Run from the repo root:
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts targets <id...|all>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts apply <workflow-output.json> <YYYY-MM-DD>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts check [id...]
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts deck <piltoverarchive deck url | uuid> [tag-sheet.json]
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts card <name>
 *   pnpm tsx .claude/skills/ingest-legends/tools.ts score <tag-sheet.json...>
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
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
  effect?: string | null
  mightBonus?: number | null
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
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const oneLine = (s: string | null | undefined) =>
  (s ?? '')
    .normalize('NFKC') // errata prefixes use mathematical bold letters
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/^Card Errata Text\s*[-–]\s*From .*?Card Errata:\s*/, '')
    .replace(/:rb_energy_(\d+):/g, '[$1]')
    .replace(/:rb_rune_rainbow:/g, '[Rune]')
    .replace(/:rb_rune_(\w+):/g, (_, d: string) => `[${cap(d)}]`)
    .replace(/:rb_might:/g, '[Might]')
    .replace(/:rb_exhaust:/g, '[Tap]')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
/** Bracketed words that are cost icons, not keywords. */
const ICONS = new Set(['rune', 'fury', 'calm', 'mind', 'body', 'chaos', 'order', 'tap', 'might', 'energy', 'exhaust'])
const codexSearch = async (name: string) =>
  (await getJson<{ items: CodexCard[] }>(`https://api.riftcodex.com/cards/name?fuzzy=${encodeURIComponent(name)}`)).items
const paSearch = async (name: string) =>
  (await getJson<{ data: { card: PaCard }[] }>(`${PA_API}/cards?q=${encodeURIComponent(name)}`)).data.map((v) => v.card)

/** Equipment's attached Might and effect live outside its rules text in both APIs' deck data. */
async function withAttachment(c: PaCard): Promise<PaCard> {
  if (c.type !== 'Gear' || !/\[equip/i.test(c.description ?? '')) return c
  const full = (await paSearch(c.name)).find((x) => x.name === c.name)
  if (!full || (!full.mightBonus && !full.effect)) return c
  const attached = [full.mightBonus ? `+${full.mightBonus} Might` : '', oneLine(full.effect)].filter(Boolean).join('. ')
  return { ...c, description: `${c.description ?? ''} Attached: ${attached.replace(/\.+$/, '')}.` }
}

/**
 * Prints one deck as a rating sheet: every card with its cost and text, then the mechanical
 * counts the deck rubric starts from. Main deck plus the chosen Champion is the 40 the rubric scores.
 */
async function deck(ref: string, outPath?: string) {
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
  // The Champion zone can hold several copies, and the same card can also sit in the main deck.
  const merged = new Map<string, Required<PaEntry>>()
  for (const e of [...champs, ...zone('maindeck')]) {
    const prev = merged.get(e.card.name)
    merged.set(e.card.name, { card: prev?.card ?? (await withAttachment(e.card)), quantity: (prev?.quantity ?? 0) + (e.quantity ?? 1) })
  }
  const main = [...merged.values()]
  const cost = (c: PaCard) => `${c.energy ?? 0}E${c.power ? ` ${c.power}P` : ''}`
  const n = (pred: (c: PaCard) => boolean) => main.reduce((s, e) => s + (pred(e.card) ? e.quantity : 0), 0)
  const total = n(() => true)
  const avg = (pred: (c: PaCard) => boolean) => {
    const k = n(pred)
    return k ? (main.reduce((s, e) => s + (pred(e.card) ? e.quantity * (e.card.energy ?? 0) : 0), 0) / k).toFixed(2) : '-'
  }
  const isUnit = (c: PaCard) => isUnitType(c.type)
  // Reminder text can name keywords the card lacks (a Gold token's "[Reaction] Kill this"), and some
  // printings drop the brackets ("Hidden (Hide now ...)").
  const has = (kw: string) => (c: PaCard) =>
    new RegExp(`\\[${kw}|\\b${cap(kw)}\\b`, 'i').test((c.description ?? '').replace(/\([^)]*\)/g, ''))

  const out: string[] = []
  out.push(`Deck: ${d.name} (${d.createdAt.slice(0, 10)})  https://piltoverarchive.com/decks/view/${uuid}`)
  out.push(`Legend: ${d.legend.name} [${d.legend.colors.map((c) => c.name).join('/')}]: ${oneLine(legendText?.text.plain) || '(text not found; run `card`)'}`)
  out.push(`Champion zone: ${champs.map((e) => `${e.quantity ?? 1}x ${e.card.name}`).join(', ') || '(empty)'}`)
  out.push(`Battlefields: ${zone('battlefields').map((e) => `${e.card.name}: ${oneLine(e.card.description)}`).join(' | ')}`)
  out.push(`Runes: ${zone('runes').map((e) => `${e.quantity} ${e.card.name}`).join(', ')}`)
  out.push('', `Main deck (${total} incl. Champion${total === 40 ? '' : '; WARNING: expected 40, scores are scaled to 40'}), by cost:`)
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

  const sheet: TagSheet = {
    deck: `https://piltoverarchive.com/decks/view/${uuid}`,
    name: d.name,
    legend: d.legend.name,
    legendText: oneLine(legendText?.text.plain),
    plan: '',
    adjustments: {},
    cards: main.map((e) => {
      const text = oneLine(e.card.description)
      return {
        qty: e.quantity,
        name: e.card.name,
        type: e.card.type,
        energy: e.card.energy ?? 0,
        power: e.card.power ?? 0,
        might: e.card.might ?? 0,
        text,
        ...suggest(e.card.type, e.card.energy ?? 0, e.card.might ?? 0, text),
      }
    }),
  }
  const file = path.resolve(outPath ?? path.join(import.meta.dirname, `../../../.scratch/decks/${uuid}.json`))
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(sheet, null, 2) + '\n')
  out.push('', `Tag sheet (roles and flags are regex guesses; check every card): ${path.relative(process.cwd(), file)}`)
  console.log(out.join('\n'))
}

// Deck rubric (deck-rubric.md). Roles and flags are the rater's judgment per card; everything
// below them is arithmetic, so two raters who tag alike score alike.
const ROLES = ['pressure', 'defender', 'value', 'removal', 'counter', 'trick', 'flow', 'ramp', 'engine', 'finisher'] as const
const FLAGS = ['reactive', 'setup', 'modes', 'luck', 'swing'] as const
type Role = (typeof ROLES)[number]
type Flag = (typeof FLAGS)[number]
interface TaggedCard {
  qty: number
  name: string
  type: string
  energy: number
  power: number
  might: number
  text: string
  role: Role
  flags: Flag[]
}
interface TagSheet {
  deck: string
  name: string
  legend: string
  legendText: string
  plan: string
  adjustments: Partial<Record<PlaystyleAxisId, { by: number; why: string }>>
  judged?: Judged
  cards: TaggedCard[]
}

/** First-pass guesses so the rater edits rather than types. Deliberately crude. */
export function suggest(type: string, energy: number, might: number, text: string): { role: Role; flags: Flag[] } {
  const t = text.replace(/\([^)]*\)/g, '') // reminder text says nothing about this card's job
  const flags: Flag[] = []
  // A mana ability ("[Reaction] — [Add] ...") can't respond to anything.
  if (/\[(reaction|hidden|ambush|quick-draw)/i.test(t.replace(/\[reaction\]\s*[-–—]\s*\[add\]/gi, ''))) flags.push('reactive')
  if (/\[(legion|empowered|level|mighty|weaponmaster)|if you'?ve|while you control|for each|\bmove (a|an|up to|your|me|it)\b|\bswap\b|\bready (a|an|it|me)\b/i.test(t)) flags.push('setup')
  if (/choose one|choose two/i.test(t) || (t.match(/\bwhen |\bwhile |\bat (the )?(start|end)|\[tap\]|\[empower\]|\[flow\]/gi) ?? []).length >= 3)
    flags.push('modes')
  if (/reveal the top.*\bif\b|\[burn/i.test(t)) flags.push('luck')
  const draws = /\bdraw \d|look at the top|\[predict|\[vision/i.test(t)
  const role: Role =
    /\bcounter (a|an|that|this|the)\b/i.test(t) ? 'counter'
    : /channel \d+ rune|ready (up to )?\d+ runes?|\[add\]|\bgold\b/i.test(t) && !isUnitType(type) ? 'ramp'
    : /\[(shield|tank)|while (i'm |it's )?(a )?defend/i.test(t) && !isUnitType(type) ? 'counter'
    : draws && type === 'Spell' && energy <= 2 ? 'flow'
    : /\bkills? (a|an|one|up to|any|all)\b(?! friendly)|deal \d+ to|\[stun\]|-\d+ \[might\]|move an enemy unit|return (an? )?enemy/i.test(t) && !isUnitType(type) ? 'removal'
    : draws && !isUnitType(type) ? 'flow'
    : type === 'Spell' ? 'trick'
    : isUnitType(type) && (energy >= 7 || (energy >= 5 && might >= 6)) ? 'finisher'
    : isUnitType(type) && /\[(shield|tank)/i.test(t) && !/\[assault/i.test(t) ? 'defender'
    : isUnitType(type) ? (energy <= 3 || /\[(accelerate|assault|ganking)/i.test(t) ? 'pressure' : 'value')
    : 'value'
  return { role, flags }
}

/** Unit Gear (Patched Porobot) is a unit too. */
const isUnitType = (type: string) => /\bUnit\b/.test(type)

const round = (x: number) => Math.min(10, Math.max(0, Math.round(x * 2) / 2))

/** Deck features, in copies scaled to 40 cards. */
export function features(cards: Pick<TaggedCard, 'qty' | 'type' | 'energy' | 'text' | 'role' | 'flags'>[]) {
  const total = cards.reduce((s, c) => s + c.qty, 0)
  const n = (pred: (c: (typeof cards)[number]) => boolean) => (40 / total) * cards.reduce((s, c) => s + (pred(c) ? c.qty : 0), 0)
  const role = (...rs: string[]) => n((c) => rs.includes(c.role))
  const reactive = (c: (typeof cards)[number]) => c.flags.includes('reactive')
  // A trick held up on the opponent's turn defends as often as it attacks.
  const pressure = role('pressure') + 0.5 * n((c) => c.role === 'trick' && !reactive(c))
  const answers = role('removal', 'counter', 'defender')
  const ownPlan = role('flow', 'ramp', 'value', 'engine', 'finisher')
  return {
    total,
    units: n((c) => isUnitType(c.type)),
    // Cheap walls don't make a deck fast.
    cheapUnits: n((c) => isUnitType(c.type) && c.energy <= 2 && c.role !== 'defender'),
    // Non-unit cards tagged pressure put attackers on the board (tokens).
    bodies: n((c) => isUnitType(c.type) || c.role === 'pressure'),
    big: n((c) => c.energy >= 5),
    pressure,
    answers,
    ownPlan,
    balance: (pressure - answers) / (pressure + answers + ownPlan),
    removal: role('removal'),
    neutral: role('flow', 'ramp', 'value', 'engine'),
    engine: role('engine'),
    ramp: role('ramp'),
    reactive: n(reactive),
    intricate: n((c) => c.role === 'engine' || c.flags.includes('setup') || c.flags.includes('modes')),
    cardFlow: n((c) => /\bdraw \d|look at the top|\[predict|\[vision/i.test(c.text)),
    luck: n((c) => c.flags.includes('luck')),
    swing: n((c) => c.flags.includes('swing')),
    threeOfs: cards.filter((c) => c.qty >= 3).reduce((s, c) => s + c.qty, 0) / total,
  }
}

type Scores = Record<PlaystyleAxisId, number>
type Judged = Partial<Scores> & { archetype?: Archetype }

/**
 * The rubric's arithmetic: tags in, four scores and an Archetype suggestion out. With the rater's
 * holistic judgment (written before scoring), the final score is the mean of the two.
 */
export function scoreSheet(s: Pick<TagSheet, 'cards' | 'adjustments'> & { judged?: Judged }) {
  const f = features(s.cards)
  const raw: Scores = {
    pace: 3.2 + 0.2 * f.cheapUnits + 0.1 * f.units - 0.2 * f.big,
    stance: 5.1 + 2.25 * f.balance + 0.06 * f.bodies - 0.025 * f.reactive - 0.14 * f.big,
    complexity: 3.8 + 0.04 * f.intricate + 0.1 * f.reactive + 0.045 * f.neutral,
    variance: 4 + 0.3 * f.luck + 0.25 * f.swing + 0.12 * (f.ramp + f.engine) - 4 * (f.threeOfs - 0.6) - 0.06 * (f.removal - 8) - 0.06 * (f.cardFlow - 5),
  }
  const formula = (a: PlaystyleAxisId) => Math.min(10, Math.max(0, raw[a] + (s.adjustments[a]?.by ?? 0)))
  const scorer = Object.fromEntries(PLAYSTYLE_AXIS_IDS.map((a) => [a, round(formula(a))])) as Scores
  const j = s.judged
  const scores = Object.fromEntries(
    PLAYSTYLE_AXIS_IDS.map((a) => [a, j?.[a] === undefined ? scorer[a] : round((formula(a) + j[a]!) / 2)]),
  ) as Scores
  const suggested = archetypeOf(scores, f)
  return { raw, scorer, scores, suggested, archetype: j?.archetype ?? suggested, inputs: f }
}

export function archetypeOf(sc: Scores, f: ReturnType<typeof features>): Archetype {
  if (f.engine >= 6) return f.answers >= 12 ? 'Control' : 'Combo'
  if (sc.stance <= 3.5) return 'Control'
  if (sc.pace >= 6.5 && sc.stance >= 6.5) return 'Aggro'
  if (f.reactive >= 14 && sc.pace >= 5) return 'Tempo'
  return 'Midrange'
}

function score(files: string[]) {
  for (const f of files) {
    const s: TagSheet = JSON.parse(readFileSync(f, 'utf8'))
    const bad = s.cards.filter((c) => !ROLES.includes(c.role) || c.flags.some((x) => !FLAGS.includes(x)))
    if (bad.length) throw new Error(`${f}: unknown role or flag on ${bad.map((c) => c.name).join(', ')}`)
    const { raw, scorer, scores, suggested, archetype, inputs } = scoreSheet(s)
    const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2))
    const row = (label: string, v: Partial<Scores>) => `  ${label.padEnd(9)} ${PLAYSTYLE_AXIS_IDS.map((a) => `${a} ${v[a] ?? '-'}`).join('  ')}`
    console.log(`${s.name}\n  ${s.legend}: ${archetype}${archetype === suggested ? '' : ` (scorer suggests ${suggested})`}`)
    if (s.judged) console.log([row('final', scores), row('scorer', scorer), row('judged', s.judged)].join('\n'))
    else console.log(`${row('scorer', scorer)}\n  No "judged" block: these are scorer-only. Write your holistic judgment first (deck-rubric.md step 5).`)
    const adj = PLAYSTYLE_AXIS_IDS.filter((a) => s.adjustments[a]).map((a) => `${a} ${s.adjustments[a]!.by > 0 ? '+' : ''}${s.adjustments[a]!.by} (${s.adjustments[a]!.why})`)
    console.log(`  raw ${PLAYSTYLE_AXIS_IDS.map((a) => `${a} ${raw[a].toFixed(2)}`).join('  ')}${adj.length ? `; adjustments: ${adj.join('; ')}` : ''}`)
    console.log(`  inputs per 40: ${Object.entries(inputs).map(([k, v]) => `${k} ${fmt(v)}`).join(', ')}`)
  }
}

/** Card text lookup for cards the rater doesn't know, e.g. from a set newer than the model. */
async function card(name: string) {
  const want = name.toLowerCase().replace(' - ', ', ')
  const codex = (await codexSearch(name)).map((c) => ({ ...c, base: c.name.replace(/\s*\(.*\)$/, '') }))
  // Printed names use a comma; Riftcodex uses " - ".
  const exact = codex.filter((c) => c.base.toLowerCase().replace(' - ', ', ') === want)
  const seen = new Set<string>()
  for (const c of exact.length ? exact : codex) {
    if (seen.has(c.base)) continue
    seen.add(c.base)
    const a = c.attributes
    const full = await withAttachment({ name: c.base.replace(' - ', ', '), type: c.classification.type, super: null, description: c.text.plain, energy: a.energy, might: a.might, power: a.power, tags: null })
    console.log(`${c.base} [${c.classification.type}, ${a.energy ?? 0}E${a.power ? ` ${a.power}P` : ''}${a.might ? `, ${a.might} might` : ''}]: ${oneLine(full.description)}`)
    if (seen.size === (exact.length ? 1 : 5)) break
  }
  if (!seen.size) {
    const pa = await paSearch(name)
    for (const c of pa.slice(0, 5))
      console.log(`${c.name} [${c.type}, ${c.energy ?? 0}E${c.power ? ` ${c.power}P` : ''}${c.might ? `, ${c.might} might` : ''}] (Piltover Archive): ${oneLine((await withAttachment(c)).description)}`)
    if (!pa.length) console.log(`No match for "${name}" on Riftcodex or Piltover Archive. Search the web for the card's text.`)
  }
}

const [cmd, ...rest] = process.argv.slice(2)
const isMain = path.resolve(process.argv[1] ?? '') === path.resolve(import.meta.filename)
if (!isMain) {
  // imported for scoreSheet
} else if (cmd === 'targets') targets(rest)
else if (cmd === 'apply') apply(rest[0], rest[1])
else if (cmd === 'check') check(rest)
else if (cmd === 'deck') await deck(rest[0], rest[1])
else if (cmd === 'card') await card(rest.join(' '))
else if (cmd === 'score') score(rest)
else console.error('usage: tools.ts targets <id...|all> | apply <output.json> <YYYY-MM-DD> | check [id...] | deck <url|uuid> [out.json] | card <name> | score <tag-sheet.json...>')
