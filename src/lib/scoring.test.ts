import { describe, expect, it } from 'vitest'
import {
  answersOf,
  ARCHETYPE_TIE_MARGIN,
  CLOSE_CALL_MARGIN,
  closeCall,
  computeProfile,
  deriveArchetype,
  DOMAIN_LEAN_THRESHOLD,
  domainLean,
  FAVOURITE_CHAMPION_BONUS,
  rankLegends,
} from './scoring'
import type { Domain } from './axes'
import type { Archetype, Legend, Profile, QuestionSet } from './types'
import { answer, build, CENTER, legend, scenario, smallQuestionSet } from './test-fixtures'

describe('scale scenarios', () => {
  const scale = {
    ...scenario('pace-scale', [answer('fast', [{ axis: 'pace', weight: 2 }]), answer('slow', [{ axis: 'pace', weight: -2 }])], [
      { axis: 'pace', reverse: false },
    ]),
    scale: true,
  }
  const set: QuestionSet = { version: 'test-1', questions: [scale] }

  it('expands two poles into four points, strong ids kept and leaning points at half strength', () => {
    expect(answersOf(scale).map((a) => [a.id, a.text, a.moves[0].weight])).toEqual([
      ['fast', 'Answer fast', 2],
      ['fast-leaning', 'Answer fast', 1],
      ['slow-leaning', 'Answer slow', -1],
      ['slow', 'Answer slow', -2],
    ])
  })

  it('reaches each end only on the strong point and lands halfway on a leaning point', () => {
    const paceFor = (id: string) => computeProfile(set, { 'pace-scale': id }).pace
    expect([paceFor('fast'), paceFor('fast-leaning'), paceFor('slow-leaning'), paceFor('slow')]).toEqual([10, 7.5, 2.5, 0])
  })
})

describe('computeProfile', () => {
  it('lands at the midpoint of every Axis when nothing is answered', () => {
    expect(computeProfile(smallQuestionSet(), {})).toEqual({
      pace: 5,
      stance: 5,
      complexity: 5,
      variance: 5,
      'fury-calm': 0,
      'mind-body': 0,
      'chaos-order': 0,
    })
  })

  it('reaches the top of an Axis when every loading Answer points the same way', () => {
    const profile = computeProfile(smallQuestionSet(), { 'pace-1': 'fast', 'pace-2': 'fast', 'pace-3': 'fast' })
    expect(profile.pace).toBe(10)
  })

  it('reaches the bottom of an Axis the same way, including reverse-keyed Questions', () => {
    const profile = computeProfile(smallQuestionSet(), { 'pace-1': 'slow', 'pace-2': 'slow', 'pace-3': 'slow' })
    expect(profile.pace).toBe(0)
  })

  it('moves partway when Answers disagree, rounded to one decimal', () => {
    // +2 +1 -2 = +1 of a possible +5 -> 5 + 1/5 * 5 = 6
    const profile = computeProfile(smallQuestionSet(), { 'pace-1': 'fast', 'pace-2': 'fast', 'pace-3': 'slow' })
    expect(profile.pace).toBe(6)
  })

  it('moves Domain Axes toward the chosen pole', () => {
    expect(computeProfile(smallQuestionSet(), { 'domain-1': 'fury' })['fury-calm']).toBe(-5)
    expect(computeProfile(smallQuestionSet(), { 'domain-1': 'order' })['chaos-order']).toBe(5)
  })

  it('ignores Answers that do not belong to the Question', () => {
    expect(computeProfile(smallQuestionSet(), { 'pace-1': 'nonsense' }).pace).toBe(5)
  })
})

describe('rankLegends', () => {
  const pool = [
    legend('far', 'Control', { pace: 0, stance: 0 }),
    legend('exact', 'Aggro', { pace: 10, stance: 10 }),
    legend('near', 'Tempo', { pace: 9, stance: 9 }),
  ]
  const fastProactive: Profile = { ...CENTER, pace: 10, stance: 10 }
  // Full affinity for the fixture Legends' default Fury/Order pair.
  const furyOrderFast: Profile = { ...fastProactive, 'fury-calm': -5, 'chaos-order': 5 }

  it('orders Legends by closeness to the Profile, closest first', () => {
    expect(rankLegends(fastProactive, pool).map((m) => m.legend.id)).toEqual(['exact', 'near', 'far'])
  })

  it('gives an identical Legend a fit of 100 and the opposite corner of all Axes a fit of 0', () => {
    const [exact] = rankLegends(furyOrderFast, pool)
    expect(exact.fit).toBe(100)
    const opposite = legend(
      'opposite',
      'Control',
      { pace: 0, stance: 0, complexity: 0, variance: 0, 'fury-calm': -5, 'mind-body': -5 },
      ['Fury', 'Mind'],
    )
    const top: Profile = { pace: 10, stance: 10, complexity: 10, variance: 10, 'fury-calm': 5, 'mind-body': 5, 'chaos-order': 5 }
    expect(rankLegends(top, [opposite])[0].fit).toBe(0)
  })

  it('keeps fit stable as the pool grows', () => {
    const before = rankLegends(fastProactive, pool).find((m) => m.legend.id === 'near')!.fit
    const after = rankLegends(fastProactive, [...pool, legend('extra', 'Combo', { complexity: 10 })]).find(
      (m) => m.legend.id === 'near',
    )!.fit
    expect(after).toBe(before)
  })

  it('nudges Legends of favourite Champions up without letting fit exceed 100', () => {
    const ranked = rankLegends(furyOrderFast, pool, { favouriteChampions: ['far', 'exact'] })
    const far = ranked.find((m) => m.legend.id === 'far')!
    const plain = rankLegends(furyOrderFast, pool).find((m) => m.legend.id === 'far')!
    expect(far.fit).toBeGreaterThan(plain.fit)
    expect(ranked[0].legend.id).toBe('exact')
    expect(ranked[0].fit).toBe(100)
  })

  it('lets the favourite bonus break a near-tie but not reorder a clear gap', () => {
    const close = [legend('first', 'Aggro', { pace: 9.9 }), legend('second', 'Aggro', { pace: 9.8 })]
    expect(rankLegends(fastProactive, close, { favouriteChampions: ['second'] })[0].legend.id).toBe('second')
    const clear = [legend('first', 'Aggro', { pace: 10, stance: 10 }), legend('second', 'Aggro', { pace: 8, stance: 8 })]
    const [first, second] = rankLegends(fastProactive, clear)
    expect(first.fit - second.fit).toBeGreaterThan(FAVOURITE_CHAMPION_BONUS)
    expect(rankLegends(fastProactive, clear, { favouriteChampions: ['second'] })[0].legend.id).toBe('first')
  })

  const fitOf = (profile: Partial<Profile>, l: Legend) => rankLegends({ ...CENTER, ...profile }, [l])[0].fit

  it('gives a fully neutral Player the same Domain term for every Legend, so playstyle alone decides', () => {
    const pairs: [Domain, Domain][] = [['Fury', 'Order'], ['Calm', 'Mind'], ['Body', 'Chaos'], ['Fury', 'Calm'], ['Mind', 'Body']]
    const sameStyle = pairs.map((domains, i) => legend(`l${i}`, 'Aggro', { pace: 7 }, domains))
    expect(new Set(sameStyle.map((l) => fitOf({}, l))).size).toBe(1)
    const ranked = rankLegends(CENTER, [legend('fury-order', 'Aggro', { pace: 9 }), legend('mind-body', 'Aggro', { pace: 6 }, ['Mind', 'Body'])])
    expect(ranked[0].legend.id).toBe('mind-body')
  })

  it("raises fit steadily as the Player's affinity for the Legend's Domains grows", () => {
    const furyOrder = legend('fury-order', 'Aggro', {})
    const fits = [5, 2.5, 0, -2.5, -5].map((furyCalm) => fitOf({ 'fury-calm': furyCalm, 'chaos-order': 2 }, furyOrder))
    fits.slice(1).forEach((fit, i) => expect(fit).toBeGreaterThan(fits[i]))
  })

  it('scores a Legend holding both Domains of an Axis on the one the Player prefers, the other as neutral', () => {
    const akali = legend('akali', 'Aggro', {}, ['Fury', 'Calm'])
    const furyOrder = legend('fury-order', 'Aggro', {}, ['Fury', 'Order'])
    const calmOrder = legend('calm-order', 'Aggro', {}, ['Calm', 'Order'])
    // Neutral on Order, so Order costs the same as Akali's unused Domain.
    for (const furyCalm of [-5, -2]) expect(fitOf({ 'fury-calm': furyCalm }, akali)).toBe(fitOf({ 'fury-calm': furyCalm }, furyOrder))
    expect(fitOf({ 'fury-calm': 4 }, akali)).toBe(fitOf({ 'fury-calm': 4 }, calmOrder))
    expect(fitOf({ 'fury-calm': -5 }, akali)).toBeGreaterThan(fitOf({}, akali))
  })

  it('leaves Legends with no reviewed Build out of the ranking', () => {
    const draft = legend('draft', 'Aggro', {}, undefined, { builds: [build('Aggro', { pace: 10, stance: 10 }, { reviewed: false })] })
    expect(rankLegends(fastProactive, [...pool, draft]).map((m) => m.legend.id)).not.toContain('draft')
  })

  it('matches each Legend once, on its closest reviewed Build', () => {
    const lux = legend('lux', 'Control', {}, undefined, {
      builds: [
        build('Control', { pace: 1, stance: 1 }),
        build('Combo', { pace: 9, stance: 9 }),
        build('Aggro', { pace: 10, stance: 10 }, { reviewed: false }),
      ],
    })
    const fast = rankLegends(fastProactive, [lux])
    expect(fast).toHaveLength(1)
    expect(fast[0].build.archetype).toBe('Combo')
    expect(rankLegends({ ...CENTER, pace: 0, stance: 0 }, [lux])[0].build.archetype).toBe('Control')
  })
})

describe('deriveArchetype', () => {
  const at = (id: string, archetype: Archetype, pace: number) => legend(id, archetype, { pace })

  it('names the Archetype of the top Match when it leads clearly', () => {
    const matches = rankLegends({ ...CENTER, pace: 10 }, [at('a', 'Aggro', 10), at('c', 'Control', 5), at('t', 'Tempo', 4)])
    expect(deriveArchetype(matches)).toBe('Aggro')
  })

  it('breaks a near-tie between differing top two by mean fit across the top five', () => {
    // Aggro leads by a hair, but Tempo holds up across the top five while a distant Aggro drags its mean.
    const matches = rankLegends({ ...CENTER, pace: 8 }, [
      at('a1', 'Aggro', 8.8),
      at('t1', 'Tempo', 7.1),
      at('t2', 'Tempo', 6.9),
      at('a2', 'Aggro', 10),
      at('c', 'Control', 0),
    ])
    expect(matches[0].build.archetype).toBe('Aggro')
    expect(matches[0].fit - matches[1].fit).toBeLessThanOrEqual(ARCHETYPE_TIE_MARGIN)
    expect(deriveArchetype(matches)).toBe('Tempo')
  })

  it('returns null for an empty pool', () => {
    expect(deriveArchetype([])).toBeNull()
  })
})

describe('closeCall', () => {
  const pool = [legend('a', 'Aggro', { pace: 10 }), legend('b', 'Tempo', { pace: 9.9 }), legend('c', 'Control', { pace: 0 })]

  it('names the top two when their fits sit within the margin', () => {
    const matches = rankLegends({ ...CENTER, pace: 10 }, pool)
    expect(matches[0].fit - matches[1].fit).toBeLessThanOrEqual(CLOSE_CALL_MARGIN)
    expect(closeCall(matches)?.map((m) => m.legend.id)).toEqual(['a', 'b'])
  })

  it('stays quiet for a clear winner or a single Match', () => {
    expect(closeCall(rankLegends({ ...CENTER, pace: 10 }, [pool[0], pool[2]]))).toBeNull()
    expect(closeCall(rankLegends(CENTER, [pool[0]]))).toBeNull()
  })
})

describe('domainLean', () => {
  const pool = [
    legend('fury-order', 'Aggro', {}, ['Fury', 'Order']),
    legend('order-fury', 'Midrange', {}, ['Order', 'Fury']),
    legend('calm-order', 'Control', {}, ['Calm', 'Order']),
    legend('fury-chaos', 'Aggro', {}, ['Fury', 'Chaos']),
  ]

  it('names the two strongest Domain Axes and their Domains, and lists Legends sharing that pair', () => {
    const lean = domainLean({ ...CENTER, 'fury-calm': -4, 'chaos-order': 3, 'mind-body': 1 }, pool)
    expect(lean.axes).toEqual(['fury-calm', 'chaos-order'])
    expect(lean.domains).toEqual(['Fury', 'Order'])
    expect(lean.legends.map((l) => l.id).sort()).toEqual(['fury-order', 'order-fury'])
  })

  it('leaves out Legends already shown in the top three', () => {
    const lean = domainLean({ ...CENTER, 'fury-calm': -4, 'chaos-order': 3 }, pool, [pool[0]])
    expect(lean.legends.map((l) => l.id)).toEqual(['order-fury'])
  })

  it('leaves out Legends with no reviewed Build', () => {
    const draft = legend('draft', 'Aggro', {}, ['Fury', 'Order'], { builds: [build('Aggro', {}, { reviewed: false })] })
    const lean = domainLean({ ...CENTER, 'fury-calm': -4, 'chaos-order': 3 }, [...pool, draft])
    expect(lean.legends.map((l) => l.id)).not.toContain('draft')
  })

  it('claims no Domain for an Axis nearer the midpoint than the lean threshold', () => {
    expect(domainLean(CENTER, pool).domains).toEqual([])
    expect(domainLean(CENTER, pool).legends).toEqual([])
    const faint = domainLean({ ...CENTER, 'fury-calm': -(DOMAIN_LEAN_THRESHOLD - 0.1), 'chaos-order': 1 }, pool)
    expect(faint.domains).toEqual([])
    expect(faint.legends).toEqual([])
    const oneSided = domainLean({ ...CENTER, 'fury-calm': -DOMAIN_LEAN_THRESHOLD, 'chaos-order': 1 }, pool)
    expect(oneSided.domains).toEqual(['Fury'])
    expect(oneSided.legends.map((l) => l.id).sort()).toEqual(['fury-chaos', 'fury-order', 'order-fury'])
  })
})
