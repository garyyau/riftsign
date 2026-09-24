/**
 * Matching simulation (informational, not a gate). Simulated Players answer the committed Questions
 * and are ranked against the reviewed pool by the real engine. Seeded, so two runs on the same data
 * print the same table. Run `pnpm simulate` before and after a weight, Question or rating change.
 *
 * Respondent model: a Player has a true position on every Axis. For each Question they pick the
 * Answer whose moves come closest to where that position points, after per-Question noise.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { AXES, AXIS_IDS, DOMAIN_POLES, normalize, type AxisId } from '../src/lib/axes'
import { domainCoordinates, validateQuestionSet } from '../src/lib/schemas'
import { answersOf, CLOSE_CALL_MARGIN, computeProfile, rankLegends } from '../src/lib/scoring'
import { ARCHETYPES, type Answer, type Answers, type Archetype, type Legend, type Match, type Profile } from '../src/lib/types'
import { loadLegends } from './lib/load-legends'

const SEED = 20260923
const SIGMA = 0.25
const SLIP_RATE = 0.25

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
  /** Options sit on a line (statement points, scale points), so a slip lands on a neighbour. */
  ordered: boolean
  reach: Partial<Record<AxisId, { high: number; low: number }>>
}

const items: Item[] = set.questions.map((q) => {
  const options = answersOf(q)
  const reach: Item['reach'] = {}
  for (const move of options.flatMap((o) => o.moves)) {
    const r = (reach[move.axis] ??= { high: 0, low: 0 })
    r.high = Math.max(r.high, move.weight)
    r.low = Math.min(r.low, move.weight)
  }
  return { id: q.id, options, ordered: q.kind === 'statement' || (q.kind === 'scenario' && q.scale === true), reach }
})

const weightOn = (option: Answer, axis: AxisId) => option.moves.find((m) => m.axis === axis)?.weight ?? 0

function respond(truth: Profile, sigma: number, slipRate = 0): Answers {
  const answers: Answers = {}
  for (const item of items) {
    const axes = Object.keys(item.reach) as AxisId[]
    const target = Object.fromEntries(
      axes.map((axis) => {
        const c = Math.max(-1, Math.min(1, 2 * normalize(axis, truth[axis]) - 1 + sigma * gauss()))
        return [axis, c >= 0 ? c * item.reach[axis]!.high : -c * item.reach[axis]!.low]
      }),
    ) as Record<AxisId, number>
    const ranked = item.options
      .map((option, i) => ({ i, error: axes.reduce((s, a) => s + (weightOn(option, a) - target[a]) ** 2, 0) + 1e-9 * rand() }))
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
const rank = (answers: Answers): Match[] => rankLegends(computeProfile(set, answers), pool)

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
}
const pct = (x: number) => `${(100 * x).toFixed(0)}%`

const playstyleCentroid = (archetype: Archetype): Partial<Profile> => {
  const of = builds.filter((b) => b.build.archetype === archetype)
  return Object.fromEntries(
    (['pace', 'stance', 'complexity', 'variance'] as const).map((axis) => [axis, mean(of.map((b) => b.build.coordinates[axis]))]),
  )
}
const archetypes = ARCHETYPES.filter((a) => builds.some((b) => b.build.archetype === a))
const isOppositePair = (l: Legend) => DOMAIN_POLES[l.domains[0]].axis === DOMAIN_POLES[l.domains[1]].axis
const samePair = (l: Legend, pair: readonly string[]) => pair.every((d) => l.domains.includes(d as Legend['domains'][number]))

const rows: [string, string][] = []
const row = (label: string, value: string) => rows.push([label, value])

// 1. Build recovery: a Player standing on a Build should get that Build's Legend.
function recovery(sigma: number, slipRate: number, trials: number) {
  let top1 = 0
  let top3 = 0
  for (const { legend, build } of builds) {
    for (let k = 0; k < trials; k++) {
      const index = rank(respond({ ...build.coordinates, ...domainCoordinates(legend.domains) }, sigma, slipRate)).findIndex((m) => m.legend.id === legend.id)
      if (index === 0) top1++
      if (index < 3) top3++
    }
  }
  const n = builds.length * trials
  return `${pct(top1 / n)} / ${pct(top3 / n)}`
}
row('Build recovery top-1 / top-3, noise-free', recovery(0, 0, 1))
row(`Build recovery top-1 / top-3, noise σ=${SIGMA}`, recovery(SIGMA, 0, 150))
row(`Build recovery top-1 / top-3, ${pct(SLIP_RATE)} neighbour slips`, recovery(0, SLIP_RATE, 150))

// 2. Playstyle-first Players: an Archetype's centroid with no or mild Domain lean (|score| <= 1.5).
{
  let own = 0
  let opposite = 0
  let players = 0
  for (const archetype of archetypes) {
    for (let k = 0; k < 300; k++) {
      const truth: Profile = {
        ...(playstyleCentroid(archetype) as Profile),
        'fury-calm': uniform(-1.5, 1.5),
        'mind-body': uniform(-1.5, 1.5),
        'chaos-order': uniform(-1.5, 1.5),
      }
      const matches = rank(respond(truth, SIGMA))
      own += matches.slice(0, 3).filter((m) => m.build.archetype === archetype).length
      if (isOppositePair(matches[0].legend)) opposite++
      players++
    }
  }
  row('Playstyle-first: own Archetype share of top-3 slots', pct(own / (3 * players)))
  row('Playstyle-first: #1 is an opposite-pair Legend', pct(opposite / players))
}

// 3. Strong-Domain Players: an Archetype centroid standing on an ordinary Domain pair's corner.
{
  const pairs = [...new Set(pool.filter((l) => !isOppositePair(l)).map((l) => [...l.domains].sort().join('/')))].map((p) => p.split('/'))
  let hits = 0
  const trials = 1500
  for (let k = 0; k < trials; k++) {
    const pair = pick(pairs)
    const truth = { ...(playstyleCentroid(pick(archetypes)) as Profile), ...domainCoordinates(pair as Legend['domains']) }
    if (samePair(rank(respond(truth, SIGMA))[0].legend, pair)) hits++
  }
  row('Strong-Domain: #1 holds their exact Domain pair', pct(hits / trials))
}

// 4. Random clicking: opposite-pair Legends should take no more than their share of the pool.
{
  const opposite = pool.filter(isOppositePair)
  const trials = 6000
  let wins = 0
  for (let k = 0; k < trials; k++) if (isOppositePair(rank(randomAnswers())[0].legend)) wins++
  const names = opposite.map((l) => l.champion).join(', ')
  row(`Random clicks: #1 is ${names} (pool share ${pct(opposite.length / pool.length)})`, pct(wins / trials))
}

// 5 and 6. Plausible Players: independent uniform traits on every Axis, answering with noise.
{
  const gaps: number[] = []
  const flips: number[] = []
  for (let k = 0; k < 1000; k++) {
    const truth = Object.fromEntries(AXIS_IDS.map((axis) => [axis, uniform(AXES[axis].min, AXES[axis].max)])) as Profile
    const answers = respond(truth, SIGMA)
    const [first, second] = rank(answers)
    gaps.push(first.fit - second.fit)
    let changed = 0
    for (const item of items) {
      for (const option of item.options) {
        if (option.id === answers[item.id]) continue
        if (rank({ ...answers, [item.id]: option.id })[0].legend.id !== first.legend.id) changed++
      }
    }
    flips.push(changed)
  }
  const within = (m: number) => pct(gaps.filter((g) => g <= m).length / gaps.length)
  row('Plausible Players: median fit gap #1 to #2', `${median(gaps)} pts`)
  row(`Plausible Players: close call (gap <= ${CLOSE_CALL_MARGIN})`, within(CLOSE_CALL_MARGIN))
  row('  gap <= 0 / 1 / 2 / 3 / 4', [0, 1, 2, 3, 4].map(within).join(' / '))
  const alternatives = items.reduce((n, item) => n + item.options.length - 1, 0)
  row('Plausible Players: mean single-answer flips that change #1', `${mean(flips).toFixed(1)} of ${alternatives}`)
}

const width = Math.max(...rows.map(([label]) => label.length))
console.log(`Riftsign simulation: ${set.questions.length} Questions (${set.version}), ${pool.length} Legends, ${builds.length} Builds, seed ${SEED}\n`)
for (const [label, value] of rows) console.log(`${label.padEnd(width)}  ${value}`)
