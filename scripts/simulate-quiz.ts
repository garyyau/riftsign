/**
 * Matching simulation (informational, not a gate). Simulated Players answer the committed Questions
 * and are ranked against the reviewed pool by the real engine. Seeded, so two runs on the same data
 * print the same table. Run `pnpm simulate` before and after a weight, Question or rating change.
 *
 * Respondent model: a Player has a true position on every score. For each Question they pick the
 * Answer whose moves come closest to where that position points, after per-Question noise.
 * Unless a population says otherwise, a Player likes the Domains they are built around (10) and
 * has no feeling about the rest (5).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DOMAIN_ID, DOMAIN_IDS, DOMAINS, normalize, PLAYSTYLE_AXIS_IDS, SCORE_IDS, type Domain, type ScoreId } from '../src/lib/axes'
import { validateQuestionSet } from '../src/lib/schemas'
import {
  answersOf,
  computeProfile,
  DOMAIN_HIGHLIGHT_THRESHOLD,
  DOMAIN_WEIGHT,
  HEADLINE_MATCHES,
  leadingDomains,
  rankLegends,
} from '../src/lib/scoring'
import { ARCHETYPES, type Answer, type Answers, type Archetype, type Legend, type Match, type Profile } from '../src/lib/types'
import { loadLegends } from './lib/load-legends'

const SEED = 20260923
const SIGMA = 0.25
const SLIP_RATE = 0.25
const THRESHOLDS = [1.5, 2, 2.5, 3, 3.5]

// `pnpm simulate [questions.json]` simulates any Question set; the committed one by default.
const questionFile = path.resolve(process.argv[2] ?? path.resolve(import.meta.dirname, '../src/data/questions.json'))
const parsed = validateQuestionSet(JSON.parse(readFileSync(questionFile, 'utf8').replace(/^﻿/, '')))
if (!parsed.success) throw new Error(`${questionFile} failed validation:\n  ${parsed.issues.join('\n  ')}`)
const set = parsed.data
const pool = loadLegends()
const builds = pool.flatMap((legend) => legend.builds.map((build) => ({ legend, build })))

// mulberry32: small, fast, and good enough for a reproducible simulation.
let state = SEED
function rand(): number {
  state = (state + 0x6d2b79f5) | 0
  let t = Math.imul(state ^ (state >>> 15), 1 | state)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]
const uniform = (min: number, max: number) => min + rand() * (max - min)

interface Item {
  id: string
  options: Answer[]
  /** Options sit on a line (statement points, or graded answers on one Axis), so a slip lands on a neighbour. */
  ordered: boolean
  reach: Partial<Record<ScoreId, { high: number; low: number }>>
}

const weightOn = (option: Answer, id: ScoreId) => option.moves.find((m) => m.axis === id)?.weight ?? 0

/** Answers that all move one Axis, listed from one end to the other. */
function isGraded(options: Answer[]): boolean {
  const axes = [...new Set(options.flatMap((o) => o.moves.map((m) => m.axis)))]
  if (axes.length !== 1) return false
  const w = options.map((o) => weightOn(o, axes[0]))
  return w.every((x, i) => i === 0 || x <= w[i - 1]) || w.every((x, i) => i === 0 || x >= w[i - 1])
}

const items: Item[] = set.questions.map((q) => {
  const options = answersOf(q)
  const reach: Item['reach'] = {}
  for (const move of options.flatMap((o) => o.moves)) {
    const r = (reach[move.axis] ??= { high: 0, low: 0 })
    r.high = Math.max(r.high, move.weight)
    r.low = Math.min(r.low, move.weight)
  }
  return { id: q.id, options, ordered: q.kind === 'statement' || isGraded(options), reach }
})

function respond(truth: Profile, sigma: number, slipRate = 0): Answers {
  const answers: Answers = {}
  for (const item of items) {
    const ids = Object.keys(item.reach) as ScoreId[]
    const target = Object.fromEntries(
      ids.map((id) => {
        const c = Math.max(-1, Math.min(1, 2 * normalize(truth[id]) - 1 + sigma * gauss()))
        return [id, c >= 0 ? c * item.reach[id]!.high : -c * item.reach[id]!.low]
      }),
    ) as Record<ScoreId, number>
    const ranked = item.options
      .map((option, i) => ({ i, error: ids.reduce((s, id) => s + (weightOn(option, id) - target[id]) ** 2, 0) + 1e-9 * rand() }))
      .sort((a, b) => a.error - b.error)
    let chosen = ranked[0].i
    if (rand() < slipRate) {
      if (!item.ordered) chosen = ranked[1].i
      else {
        const step = rand() < 0.5 ? -1 : 1
        chosen = chosen + step < 0 || chosen + step >= item.options.length ? chosen - step : chosen + step
      }
    }
    answers[item.id] = item.options[chosen].id
  }
  return answers
}

const randomAnswers = (): Answers => Object.fromEntries(items.map((item) => [item.id, pick(item.options).id]))
const rank = (profile: Profile): Match[] => rankLegends(profile, pool)

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const pct = (x: number) => `${(100 * x).toFixed(0)}%`
const share = <T>(xs: T[], test: (x: T) => boolean) => pct(xs.filter(test).length / xs.length)

const OPPOSITE_PAIRS: [Domain, Domain][] = [['Fury', 'Calm'], ['Mind', 'Body'], ['Chaos', 'Order']]
/** A Player who likes these Domains (10) and has no feeling about the rest (5). */
const liking = (domains: readonly Domain[]) =>
  Object.fromEntries(DOMAIN_IDS.map((id) => [id, domains.some((d) => DOMAIN_ID[d] === id) ? 10 : 5]))
/** The other Domain of a Domain's old opposite pair. */
const opposite = (d: Domain) => OPPOSITE_PAIRS.flat()[OPPOSITE_PAIRS.flat().indexOf(d) ^ 1]
/** v2's strong-Domain Player sat on two Axis poles: loving the pair also meant disliking (0) its opposites. */
const polar = (domains: readonly Domain[]) => ({ ...liking(domains), ...Object.fromEntries(domains.map((d) => [DOMAIN_ID[opposite(d)], 0])) })
const playstyleCentroid = (archetype: Archetype) => {
  const of = builds.filter((b) => b.build.archetype === archetype)
  return Object.fromEntries(PLAYSTYLE_AXIS_IDS.map((axis) => [axis, mean(of.map((b) => b.build.coordinates[axis]))]))
}
const player = (...parts: Record<string, number>[]) => Object.assign({}, ...parts) as Profile
const archetypes = ARCHETYPES.filter((a) => builds.some((b) => b.build.archetype === a))
const isOppositePair = (l: Legend) => OPPOSITE_PAIRS.some((pair) => samePair(l.domains, pair))
const samePair = (a: readonly Domain[], b: readonly Domain[]) => a.length === b.length && b.every((d) => a.includes(d))

const rows: [string, string][] = []
const row = (label: string, value: string) => rows.push([label, value])
const section = (title: string) => rows.push([title, ''])

// 1. Build recovery: a Player standing on a Build, liking its Legend's Domains, should get that Legend.
function recovery(sigma: number, slipRate: number, trials: number) {
  let top1 = 0
  let top3 = 0
  for (const { legend, build } of builds) {
    for (let k = 0; k < trials; k++) {
      const truth = player(build.coordinates, liking(legend.domains))
      const index = rank(computeProfile(set, respond(truth, sigma, slipRate))).findIndex((m) => m.legend.id === legend.id)
      if (index === 0) top1++
      if (index < 3) top3++
    }
  }
  const n = builds.length * trials
  return `${pct(top1 / n)} / ${pct(top3 / n)}`
}
section('Build recovery')
row('  top-1 / top-3, noise-free', recovery(0, 0, 1))
row(`  top-1 / top-3, noise σ=${SIGMA}`, recovery(SIGMA, 0, 150))
row(`  top-1 / top-3, ${pct(SLIP_RATE)} neighbour slips`, recovery(0, SLIP_RATE, 150))

// 2. Playstyle-first Players: an Archetype's centroid with every Domain within 1.5 of neutral.
section('Playstyle-first Players (every Domain 3.5 to 6.5)')
{
  let own3 = 0
  let own2 = 0
  const tops: Match[] = []
  for (const archetype of archetypes) {
    for (let k = 0; k < 300; k++) {
      const domains = Object.fromEntries(DOMAIN_IDS.map((id) => [id, uniform(3.5, 6.5)]))
      const matches = rank(computeProfile(set, respond(player(playstyleCentroid(archetype), domains), SIGMA)))
      own3 += matches.slice(0, 3).filter((m) => m.build.archetype === archetype).length
      own2 += matches.slice(0, HEADLINE_MATCHES).filter((m) => m.build.archetype === archetype).length
      tops.push(matches[0])
    }
  }
  row('  own Archetype share of top-3 slots', pct(own3 / (3 * tops.length)))
  row(`  own Archetype share of the top-${HEADLINE_MATCHES} headline`, pct(own2 / (HEADLINE_MATCHES * tops.length)))
  row('  #1 is an opposite-pair Legend', share(tops, (m) => isOppositePair(m.legend)))
}

/**
 * The model's answers, except that a fan always takes a loved Domain's answer when a Question
 * offers one, at random if it offers both. The model can pass on a loved Domain when its other
 * scores pull toward a neutral answer.
 */
function asFan(answers: Answers, loved: readonly Domain[]): Answers {
  const out = { ...answers }
  const ids = loved.map((d) => DOMAIN_ID[d])
  for (const item of items) {
    const options = item.options.filter((o) => ids.some((id) => weightOn(o, id) > 0))
    if (options.length) out[item.id] = pick(options).id
  }
  return out
}

/** Players built around a Domain pair: #1 hit rate, how often "Your Domains" names exactly that pair, and the pair's mean score. */
function domainPlayers(pairs: [Domain, Domain][], trials: number, { truthOf = liking, fan = false } = {}) {
  const profiles: { profile: Profile; pair: [Domain, Domain] }[] = []
  let hits = 0
  for (let k = 0; k < trials; k++) {
    const pair = pick(pairs)
    const answers = respond(player(playstyleCentroid(pick(archetypes)), truthOf(pair)), SIGMA)
    const profile = computeProfile(set, fan ? asFan(answers, pair) : answers)
    if (samePair(rank(profile)[0].legend.domains, pair)) hits++
    profiles.push({ profile, pair })
  }
  const named = (t: number) => share(profiles, ({ profile, pair }) => samePair(leadingDomains(profile, t), pair))
  const reached = mean(profiles.flatMap(({ profile, pair }) => pair.map((d) => profile[DOMAIN_ID[d]]))).toFixed(1)
  return { hits: pct(hits / trials), named, reached }
}

// 3. Strong-Domain Players: an Archetype centroid who loves an ordinary Domain pair.
section('Strong-Domain Players (love one ordinary pair, neutral on the rest)')
const ordinaryPairs = [...new Set(pool.filter((l) => !isOppositePair(l)).map((l) => [...l.domains].sort().join('/')))].map(
  (p) => p.split('/') as [Domain, Domain],
)
const strong = domainPlayers(ordinaryPairs, 1500)
const strongFan = domainPlayers(ordinaryPairs, 1500, { fan: true })
// Comparable with v2, where loving a pair meant sitting on the poles of two bipolar Axes.
const strongPolar = domainPlayers(ordinaryPairs, 1500, { truthOf: polar })
row('  #1 holds their exact Domain pair: model / fan', `${strong.hits} / ${strongFan.hits}`)
row('  #1 holds their pair when they also dislike its opposites (v2 population)', strongPolar.hits)
row('  mean score on their two Domains: model / fan', `${strong.reached} / ${strongFan.reached}`)
row(`  "Your Domains" names that pair (threshold ${DOMAIN_HIGHLIGHT_THRESHOLD}): model / fan`, `${strong.named(DOMAIN_HIGHLIGHT_THRESHOLD)} / ${strongFan.named(DOMAIN_HIGHLIGHT_THRESHOLD)}`)

// 4. Players who like both Domains of an old opposite pair, e.g. Fury and Calm.
section('Players who like both Domains of an old opposite pair')
const both = domainPlayers(OPPOSITE_PAIRS, 900)
const bothFan = domainPlayers(OPPOSITE_PAIRS, 900, { fan: true })
row('  #1 holds both Domains: model / fan', `${both.hits} / ${bothFan.hits}`)
row('  mean score on the two Domains: model / fan', `${both.reached} / ${bothFan.reached}`)
row(`  "Your Domains" names both (threshold ${DOMAIN_HIGHLIGHT_THRESHOLD}): model / fan`, `${both.named(DOMAIN_HIGHLIGHT_THRESHOLD)} / ${bothFan.named(DOMAIN_HIGHLIGHT_THRESHOLD)}`)

// 5. Domain-neutral Players: any playstyle, no feeling about any Domain.
const styles = Array.from({ length: 1500 }, () => Object.fromEntries(PLAYSTYLE_AXIS_IDS.map((axis) => [axis, uniform(0, 10)])))
const neutral = styles.map((style) => respond(player(style, liking([])), SIGMA))
const neutralProfiles = neutral.map((answers) => computeProfile(set, answers))
const quiet = (profiles: Profile[]) => (t: number) => share(profiles, (p) => leadingDomains(p, t).length === 0)
const topDomains = (profiles: Profile[]) => DOMAINS.map((d) => share(profiles, (p) => rank(p)[0].legend.domains.includes(d))).join(' / ')
section('Domain-neutral Players (every Domain 5)')
row(`  "Your Domains" stays quiet (threshold ${DOMAIN_HIGHLIGHT_THRESHOLD})`, quiet(neutralProfiles)(DOMAIN_HIGHLIGHT_THRESHOLD))
row('  #1 is an opposite-pair Legend', share(neutralProfiles, (p) => isOppositePair(rank(p)[0].legend)))
row(`  #1 holds ${DOMAINS.join(' / ')}`, topDomains(neutralProfiles))

// 6. The highlight threshold trades naming a real pair against staying quiet for a neutral Player.
section(`Highlight threshold ${THRESHOLDS.join(' / ')}`)
row('  strong-Domain pair named: model', THRESHOLDS.map(strong.named).join(' / '))
row('  strong-Domain pair named: fan', THRESHOLDS.map(strongFan.named).join(' / '))
row('  strong-Domain pair named: v2 population', THRESHOLDS.map(strongPolar.named).join(' / '))
row('  opposite-pair likers, both named: model', THRESHOLDS.map(both.named).join(' / '))
row('  opposite-pair likers, both named: fan', THRESHOLDS.map(bothFan.named).join(' / '))
row('  Domain-neutral: stays quiet', THRESHOLDS.map(quiet(neutralProfiles)).join(' / '))

// 7. Random clicking: opposite-pair Legends should take no more than their share of the pool.
section('Random clicks')
{
  const opposite = pool.filter(isOppositePair)
  const tops = Array.from({ length: 6000 }, () => rank(computeProfile(set, randomAnswers()))[0])
  row(`  #1 is ${opposite.map((l) => l.champion).join(', ')} (pool share ${pct(opposite.length / pool.length)})`, share(tops, (m) => isOppositePair(m.legend)))
}

// 8. Plausible Players: independent uniform traits on every score, answering with noise.
section('Plausible Players (every score uniform 0 to 10)')
{
  const gaps: number[] = []
  const flips: number[] = []
  for (let k = 0; k < 1000; k++) {
    const truth = Object.fromEntries(SCORE_IDS.map((id) => [id, uniform(0, 10)])) as Profile
    const answers = respond(truth, SIGMA)
    const [first, second] = rank(computeProfile(set, answers))
    gaps.push(first.fit - second.fit)
    let changed = 0
    for (const item of items) {
      for (const option of item.options) {
        if (option.id === answers[item.id]) continue
        if (rank(computeProfile(set, { ...answers, [item.id]: option.id }))[0].legend.id !== first.legend.id) changed++
      }
    }
    flips.push(changed)
  }
  const within = (m: number) => pct(gaps.filter((g) => g <= m).length / gaps.length)
  row('  median fit gap #1 to #2', `${median(gaps)} pts`)
  row('  gap <= 0 / 1 / 2 / 3 / 4', [0, 1, 2, 3, 4].map(within).join(' / '))
  const alternatives = items.reduce((n, item) => n + item.options.length - 1, 0)
  row('  mean single-answer flips that change #1', `${mean(flips).toFixed(1)} of ${alternatives}`)
}

const width = Math.max(...rows.map(([label]) => label.length))
console.log(
  `Riftward simulation: ${set.questions.length} Questions (${set.version}), ${pool.length} Legends, ${builds.length} Builds, ` +
    `DOMAIN_WEIGHT ${DOMAIN_WEIGHT}, seed ${SEED}\n`,
)
for (const [label, value] of rows) console.log(value ? `${label.padEnd(width)}  ${value}` : label)
