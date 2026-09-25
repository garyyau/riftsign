/**
 * Candidate decks and styles for a Legend, from Piltover Archive (sources.md has the recipe and the
 * thresholds' reasons; docs/research/2026-09-25-deck-styles-and-quality.md the method). Everything
 * here is mechanical: pool, evidence points, card-overlap grouping, ban check, proposed decks. The
 * judgments (grey-zone merges, joke brews, claimed results, naming, loosening) are the agent's.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const API = 'https://piltoverarchive.com/api/external/v1'
const SYSTEM = '08c7c126-8ec7-4594-9f37-b313a201e2e3'
const ROOT = path.resolve(import.meta.dirname, '../../..')
const CACHE = path.join(ROOT, '.scratch/ingest/cache')

/** Style grouping cut, grey-zone ceiling, and "typical of the style" radius, in weighted-Jaccard distance. */
const CUT = 0.5
const GREY = 0.65
const TYPICAL = 0.35
const STRONG = 3
const FAIR = 1.5
const POOL_CAP = 150
/** Two lists this close are one list posted twice (a repost or a copy). */
const COPY = 0.05
/** Legal decks with no evidence, fetched to help measure small styles; they never count toward a bar. */
const FILLERS = 30

interface ListDeck {
  id: string
  name: string
  authorId: string
  authorName: string
  teamOwners: unknown[]
  views: number
  likes: number
  editedAt: string
  createdAt: string
  contentFlags: { hasVideo: boolean; hasGuide: boolean; hasMatchups: boolean }
  isLegal: boolean
  bannedCardNames: string[]
}
interface Entry {
  quantity?: number
  card: { name: string }
}

let last = 0
/** About 3 requests a second: the API sent a 429 at 4. */
async function get<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const wait = last + 350 - Date.now()
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    last = Date.now()
    const res = await fetch(url)
    if (res.ok) return res.json() as Promise<T>
    if (res.status !== 429 || attempt === 4) throw new Error(`${res.status} from ${url}`)
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
  }
}

/** sources.md's Bans list is the single record of the ban list; its newest date is the latest ban. */
function banList() {
  const text = readFileSync(path.join(import.meta.dirname, 'sources.md'), 'utf8')
  const bans = text.slice(text.indexOf('## Bans'))
  const date = bans.match(/^- (\d{4}-\d{2}-\d{2}):/m)?.[1]
  if (!date) throw new Error('no ban date under "## Bans" in sources.md')
  return { date, text: bans }
}

/** The two newest main sets out today, newest first. Nexus Night promos aren't sets that move the meta. */
async function mainSets(today: string) {
  const sets = (await get<{ data: { name: string; releaseDate: string }[] }>(`${API}/sets`)).data
  return sets.filter((s) => !/nexus night/i.test(s.name) && s.releaseDate <= today).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
}

async function legendCardId(name: string) {
  const rows = (await get<{ data: { card: { id: string; name: string; type: string } }[] }>(`${API}/cards?q=${encodeURIComponent(name)}&limit=50`)).data
  const hit = rows.find((r) => r.card.type === 'Legend' && r.card.name.toLowerCase() === name.toLowerCase())
  if (!hit) throw new Error(`no Legend card named "${name}" on Piltover Archive`)
  return hit.card.id
}

async function listDecks(cardId: string, since: string, author = '') {
  const out: ListDeck[] = []
  for (let page = 1; ; page++) {
    const r = await get<{ data: ListDeck[]; pagination: { total: number } }>(
      `${API}/decks?legendId=${cardId}&editedAfter=${since}${author && `&authorId=${author}`}&sort=createdAt&order=desc&limit=100&page=${page}`,
    )
    out.push(...r.data)
    if (r.data.length < 100 || out.length >= r.pagination.total) return out
  }
}

/** Main deck plus Champion zone as copy counts by card name; cached by edit time. */
async function cardsOf(d: ListDeck): Promise<{ cards: Record<string, number>; champions: string[] }> {
  const file = path.join(CACHE, `${d.id}.json`)
  if (existsSync(file)) {
    const c = JSON.parse(readFileSync(file, 'utf8'))
    if (c.editedAt === d.editedAt) return c
  }
  const raw = await get<Record<string, unknown>>(`${API}/decks/${d.id}?expand=cards`)
  const x = (raw.data ?? raw) as { expandedCards: Record<string, Entry[] | null> }
  const cards: Record<string, number> = {}
  for (const e of [...(x.expandedCards.champions ?? []), ...(x.expandedCards.maindeck ?? [])])
    cards[e.card.name] = (cards[e.card.name] ?? 0) + (e.quantity ?? 1)
  const champions = (x.expandedCards.champions ?? []).map((e) => e.card.name)
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(file, JSON.stringify({ editedAt: d.editedAt, cards, champions }))
  return { cards, champions }
}

const PRECON = /pre-?rift kit|precon|starter|budget|champion deck|proxy/i
const CLAIM = /\btop ?\d|#\d|\b\d+(st|nd|rd|th)\b|best of|winner|undefeated|\d-\d\b|qualif|regional|nationals?|champion(ship)?s?\b/i

/**
 * Tournament points from a system deck's name. "Best of" goes to each Legend's best finisher at any
 * placement, so it ranks below an RQ top 8.
 */
function placementPoints(name: string): { points: number; why: string } {
  const n = Number(name.match(/#(\d+)/)?.[1] ?? name.match(/\b(\d+)(st|nd|rd|th)\b/i)?.[1] ?? NaN)
  if (/best of/i.test(name)) return { points: 3, why: 'Best of' }
  if (/regional qualifier/i.test(name)) return n <= 8 ? { points: 5, why: `RQ #${n}` } : { points: 3, why: `RQ #${n}` }
  if (/city challenge/i.test(name))
    return n <= 8 ? { points: 3, why: `City Challenge #${n}` } : n <= 32 ? { points: 1.5, why: `City Challenge #${n}` } : { points: 0.5, why: `City Challenge #${n}` }
  if (/open/i.test(name) && !Number.isNaN(n))
    return n <= 32 ? { points: 3, why: `Open #${n}` } : n < 500 ? { points: 1.5, why: `Open #${n}` } : { points: 0.5, why: `Open #${n}` }
  return { points: 1.5, why: 'tournament, placement unread' }
}

/** Tournament decks all come from the system account; the player, in the name's parentheses, is the author. */
const authorOf = (d: ListDeck) => (d.authorId === SYSTEM ? `player:${d.name.match(/\(([^)]+)\)\s*$/)?.[1] ?? d.name}` : d.authorId)

function evidence(d: ListDeck, ban: string, since: string) {
  const why: string[] = []
  let points = 0
  if (d.authorId === SYSTEM) {
    const p = placementPoints(d.name)
    points += p.points
    why.push(p.why)
  }
  if (d.likes) {
    points += Math.min(4, Math.log2(1 + d.likes))
    why.push(`${d.likes} likes`)
  }
  const f = d.contentFlags
  const bonuses: [boolean, number, string][] = [
    [f.hasGuide, 1, 'guide'],
    [f.hasVideo, 0.5, 'video'],
    [f.hasMatchups, 0.5, 'matchups'],
    [d.teamOwners.length > 0, 1, 'team'],
    [d.views >= 1000, 0.5, `${d.views} views`],
  ]
  for (const [on, add, label] of bonuses)
    if (on) {
      points += add
      why.push(label)
    }
  const edited = d.editedAt.slice(0, 10)
  // Legal lists from before the latest ban usually still work; their likes have had longer to build.
  const age = edited < since ? { by: 0.5, label: 'before the latest set, halved' } : edited < ban ? { by: 0.75, label: 'pre-ban, x0.75' } : null
  if (age) {
    points *= age.by
    why.push(age.label)
  }
  return { points: Math.round(points * 10) / 10, why }
}

/** Weighted Jaccard (Ruzicka) over copy counts; banned cards were already left out. */
function distance(a: Record<string, number>, b: Record<string, number>) {
  let lo = 0
  let hi = 0
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    lo += Math.min(a[k] ?? 0, b[k] ?? 0)
    hi += Math.max(a[k] ?? 0, b[k] ?? 0)
  }
  return hi ? 1 - lo / hi : 0
}

/** Average-linkage agglomerative clustering, merging until the closest pair is CUT apart. */
function cluster(D: number[][]) {
  let groups = D.map((_, i) => [i])
  const link = (a: number[], b: number[]) => a.reduce((s, i) => s + b.reduce((t, j) => t + D[i][j], 0), 0) / (a.length * b.length)
  for (;;) {
    let best = { d: Infinity, i: -1, j: -1 }
    for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++) {
        const d = link(groups[i], groups[j])
        if (d < best.d) best = { d, i, j }
      }
    if (best.d >= CUT) return { groups, link }
    groups = [...groups.filter((_, k) => k !== best.i && k !== best.j), [...groups[best.i], ...groups[best.j]]]
  }
}

export async function candidates(ids: string[], opts: { today: string; since?: string }) {
  const { date: ban, text: banText } = banList()
  const unlisted = new Set<string>()
  const [set, previous] = await mainSets(opts.today)
  const since = opts.since ?? set.releaseDate
  console.log(`Window: edited since ${since}${opts.since ? '' : ` (${set.name} release)`}, tournament lists since ${previous.releaseDate} (${previous.name}); latest ban ${ban}.`)
  for (const id of ids) {
    const legend = JSON.parse(readFileSync(path.join(ROOT, 'src/data/legends', `${id}.json`), 'utf8')) as { name: string }
    const cardId = await legendCardId(legend.name)
    // Tournament lists from the set before stay in, halved: often still how the Legend is played.
    const recent = await listDecks(cardId, since)
    const older = (await listDecks(cardId, previous.releaseDate, SYSTEM)).filter((d) => !recent.some((r) => r.id === d.id))
    const listed = [...recent, ...older]
    for (const d of listed) for (const b of d.bannedCardNames) if (!banText.includes(b)) unlisted.add(b)
    const scored = listed
      .filter((d) => !PRECON.test(d.name))
      .map((d) => ({ d, ...evidence(d, ban, set.releaseDate) }))
      .sort((a, b) => b.points - a.points || b.d.views - a.d.views)
    // Decks with no evidence at all are noise, unless the Legend has fewer than 10 legal decks with
    // some (Lux after its combo was banned): then the most-viewed legal decks fill the gap.
    const withPoints = scored.filter((s) => s.points > 0)
    const legalShort = 10 - withPoints.filter((s) => s.d.isLegal).length
    const fill = scored.filter((s) => s.points === 0 && s.d.isLegal).sort((a, b) => b.d.views - a.d.views).slice(0, Math.max(0, legalShort))
    const vec = async (d: ListDeck) => {
      const { cards, champions } = await cardsOf(d)
      for (const b of d.bannedCardNames) delete cards[b]
      return { cards, champions }
    }
    // Strongest first, so a repost folds into the list it copies.
    const pool: ((typeof scored)[number] & { copies: string[] })[] = []
    const vectors: Record<string, number>[] = []
    const champions: string[][] = []
    for (const s of [...withPoints.slice(0, POOL_CAP), ...fill]) {
      const v = await vec(s.d)
      const orig = vectors.findIndex((w) => distance(v.cards, w) <= COPY)
      if (orig >= 0) {
        pool[orig].copies.push(`${s.d.name} (${s.d.authorName})`)
        continue
      }
      pool.push({ ...s, copies: [] })
      vectors.push(v.cards)
      champions.push(v.champions)
    }
    const total = (v: Record<string, number>) => Object.values(v).reduce((s, x) => s + x, 0)
    const D = vectors.map((a) => vectors.map((b) => distance(a, b)))
    const { groups, link } = cluster(D)
    // Evidence-less legal lists join the style they sit inside, to measure it, never to vouch for it.
    const fillers: { s: (typeof scored)[number]; cards: Record<string, number>; group: number; dist: number }[] = []
    const pooled = new Set(pool.map((p) => p.d.id))
    for (const s of scored.filter((x) => x.points === 0 && x.d.isLegal && !pooled.has(x.d.id)).sort((a, b) => b.d.views - a.d.views).slice(0, FILLERS)) {
      const { cards } = await vec(s.d)
      if (vectors.some((w) => distance(cards, w) <= COPY)) continue
      const near = groups.map((g, k) => ({ k, d: g.reduce((t, i) => t + distance(cards, vectors[i]), 0) / g.length })).sort((a, b) => a.d - b.d)[0]
      if (near && near.d < CUT) fillers.push({ s, cards, group: near.k, dist: near.d })
    }

    const all = groups
      .map((g, k) => {
        const medoid = g.reduce((best, i) => (g.reduce((s, j) => s + D[i][j], 0) < g.reduce((s, j) => s + D[best][j], 0) ? i : best), g[0])
        const share = (card: string, members: number[]) => members.filter((i) => vectors[i][card]).length / (members.length || 1)
        const cards = [...new Set(g.flatMap((i) => Object.keys(vectors[i])))]
        const others = pool.map((_, i) => i).filter((i) => !g.includes(i))
        const core = cards.filter((c) => share(c, g) >= 0.8)
        const signature = core.filter((c) => share(c, others) <= 0.25)
        const banned = [...new Set(g.flatMap((i) => pool[i].d.bannedCardNames))]
        const decks = g
          .map((i) => ({ i, s: pool[i], dist: Math.round(D[medoid][i] * 100) / 100 }))
          .sort((a, b) => b.s.points - a.s.points || a.dist - b.dist)
        const legal = decks.filter((x) => x.s.d.isLegal)
        // A list illegal only for a card outside the signature (a banned battlefield, a utility
        // spell) still shows the plan works: it vouches for the style, though it can't be shown.
        const vouch = decks.filter((x) => x.s.d.isLegal || !x.s.d.bannedCardNames.some((b) => signature.includes(b)))
        const authors = new Set(g.map((i) => authorOf(pool[i].d)))
        const strong = vouch.filter((x) => x.s.points >= STRONG)
        const fairOtherAuthor = (x: (typeof vouch)[number]) => vouch.some((y) => authorOf(y.s.d) !== authorOf(x.s.d) && y.s.points >= FAIR)
        const vouchAuthors = new Set(vouch.map((x) => authorOf(x.s.d))).size
        // Four or more players running it is evidence of its own, before likes catch up.
        const bar =
          strong.some(fairOtherAuthor) ? 'strict'
          : vouch.some((x) => x.s.points >= FAIR && fairOtherAuthor(x)) ? 'loosened'
          : vouchAuthors >= 4 && vouch.some((x) => x.s.points >= FAIR) ? 'loosened'
          : strong.length ? 'lone strong deck'
          : vouch.some((x) => x.s.points >= FAIR) ? 'lone fair deck'
          : 'weak'
        // Scored decks: the medoid first when legal, then the strongest, one per author; fillers top up to 3.
        const pickOrder = [...legal].sort((a, b) => (a.i === medoid ? -1 : b.i === medoid ? 1 : 0))
        const seen = new Set<string>()
        const scoredDecks = pickOrder.filter((x) => !seen.has(authorOf(x.s.d)) && seen.add(authorOf(x.s.d))).slice(0, 4)
        const extra = fillers
          .filter((f) => f.group === k)
          .sort((a, b) => a.dist - b.dist)
          .map((f) => ({ url: `https://piltoverarchive.com/decks/view/${f.s.d.id}`, name: f.s.d.name, author: f.s.d.authorName, edited: f.s.d.editedAt.slice(0, 10), distToStyle: Math.round(f.dist * 100) / 100, cards: total(f.cards), key: authorOf(f.s.d) }))
          .filter((f) => !seen.has(f.key) && seen.add(f.key))
          .map(({ key: _key, ...f }) => f)
        const fillerScored = extra.slice(0, Math.max(0, 3 - scoredDecks.length))
        const display = legal.filter((x) => x.dist <= TYPICAL)[0] ?? legal[0]
        return {
          g,
          decks: g.length,
          authors: authors.size,
          evidence: Math.round(decks.slice(0, 3).reduce((s, x) => s + x.s.points, 0) * 10) / 10,
          bar,
          // Dead: the plan itself is banned, or nobody has a legal list of it.
          dead: banned.some((b) => signature.includes(b)) || (!legal.length && !extra.length),
          legalDecks: legal.length + extra.length,
          bannedInStyle: banned,
          champions: [...new Set(g.flatMap((i) => champions[i]))],
          signature,
          core: core.filter((c) => !signature.includes(c)),
          display: display && link_(display),
          scored: [...scoredDecks.map(link_), ...fillerScored.map((f) => ({ ...f, filler: true }))],
          members: decks.map(link_),
          fillers: extra,
        }
        function link_(x: (typeof decks)[number]) {
          const d = x.s.d
          return {
            url: `https://piltoverarchive.com/decks/view/${d.id}`,
            name: d.name,
            author: d.authorName,
            points: x.s.points,
            why: x.s.why.join(', '),
            legal: d.isLegal,
            edited: d.editedAt.slice(0, 10),
            distToMedoid: x.dist,
            cards: total(vectors[x.i]),
            ...(x.s.copies.length ? { copies: x.s.copies } : {}),
            ...(d.authorId !== SYSTEM && CLAIM.test(d.name) ? { claimsResult: true } : {}),
          }
        }
      })
      .sort((a, b) => b.evidence - a.evidence)
    // A deck alone, or a group from one author, is one brewer's idea: a style only at a lone bar.
    // A Legend with no live style above weak keeps its five best legal loners as a fallback, so the
    // curator has a start.
    const real = (s: (typeof all)[number]) => (s.decks >= 2 && s.authors >= 2) || s.bar.startsWith('lone')
    const styles = all.some((s) => real(s) && !s.dead && s.bar !== 'weak')
      ? all.filter(real)
      : [...all.filter(real), ...all.filter((s) => !real(s) && !s.dead).slice(0, 5).map((s) => ({ ...s, bar: 'fallback' }))]

    const grey = styles.flatMap((a, i) =>
      styles.slice(i + 1).map((b, j) => ({ a: i + 1, b: i + j + 2, d: Math.round(link(a.g, b.g) * 100) / 100 })).filter((p) => p.d < GREY),
    )
    const out = {
      legend: legend.name,
      window: { since, tournamentSince: previous.releaseDate, latestBan: ban, set: set.name },
      pool: { listed: listed.length, withEvidence: withPoints.length, grouped: pool.length },
      styles: styles.map(({ g: _g, ...s }, k) => ({ style: k + 1, ...s })),
      greyZone: grey,
    }
    const file = path.join(ROOT, '.scratch/ingest', id, 'candidates.json')
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(out, null, 2) + '\n')

    console.log(`\n${legend.name}: ${listed.length} decks listed, ${withPoints.length} with evidence, ${pool.length} grouped -> ${styles.length} style(s)`)
    const quiet = (b: string) => b === 'weak' || b === 'fallback'
    const weak = out.styles.filter((s) => quiet(s.bar)).length
    for (const s of out.styles.filter((s) => !quiet(s.bar)))
      console.log(
        `  ${s.style}. ${s.bar.padEnd(16)} ${String(s.decks).padStart(3)} decks ${String(s.authors).padStart(3)} authors  evidence ${s.evidence}${s.dead ? '  DEAD' : ''}  sig: ${s.signature.slice(0, 5).join(', ') || '-'}`,
      )
    if (weak) console.log(`  + ${weak} weak or fallback style(s), in the file`)
    for (const p of grey) console.log(`  grey zone: styles ${p.a} and ${p.b} at ${p.d}`)
    console.log(`  -> ${path.relative(process.cwd(), file)}`)
  }
  if (unlisted.size) console.log(`\nNEW BAN? Piltover Archive marks these banned but sources.md doesn't list them: ${[...unlisted].join(', ')}. Add them with their date; the window and pre-ban weighting read that list.`)
}
