import { describe, expect, it } from 'vitest'
import { ARCHETYPE_TIE_MARGIN, computeProfile, deriveArchetype, domainLean, rankLegends } from './scoring'
import type { Archetype, Profile } from './types'
import { CENTER, legend, smallQuestionSet } from './test-fixtures'

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

  it('orders Legends by closeness to the Profile, closest first', () => {
    expect(rankLegends(fastProactive, pool).map((m) => m.legend.id)).toEqual(['exact', 'near', 'far'])
  })

  it('gives an identical Legend a fit of 100 and the opposite corner of all Axes a fit of 0', () => {
    const [exact] = rankLegends(fastProactive, pool)
    expect(exact.fit).toBe(100)
    const opposite = legend('opposite', 'Control', {
      pace: 0,
      stance: 0,
      complexity: 0,
      variance: 0,
      'fury-calm': -5,
      'mind-body': -5,
      'chaos-order': -5,
    })
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
    const ranked = rankLegends(fastProactive, pool, { favouriteChampions: ['far', 'exact'] })
    const far = ranked.find((m) => m.legend.id === 'far')!
    const plain = rankLegends(fastProactive, pool).find((m) => m.legend.id === 'far')!
    expect(far.fit).toBeGreaterThan(plain.fit)
    expect(ranked[0].legend.id).toBe('exact')
    expect(ranked[0].fit).toBe(100)
  })

  it('leaves unreviewed Legends out of the ranking', () => {
    const ranked = rankLegends(fastProactive, [...pool, legend('draft', 'Aggro', { pace: 10, stance: 10 }, undefined, { reviewed: false })])
    expect(ranked.map((m) => m.legend.id)).not.toContain('draft')
  })
})

describe('deriveArchetype', () => {
  const at = (id: string, archetype: Archetype, pace: number) => legend(id, archetype, { pace })

  it('names the Archetype of the top Match when it leads clearly', () => {
    const matches = rankLegends({ ...CENTER, pace: 10 }, [at('a', 'Aggro', 10), at('c', 'Control', 5), at('t', 'Tempo', 4)])
    expect(deriveArchetype(matches)).toBe('Aggro')
  })

  it('breaks a near-tie between differing top two by mean fit across the top five', () => {
    // Aggro and Tempo at equal distance; two more Tempo Legends close behind tilt the mean.
    const matches = rankLegends({ ...CENTER, pace: 8 }, [
      at('a', 'Aggro', 9),
      at('t1', 'Tempo', 7),
      at('t2', 'Tempo', 7.2),
      at('t3', 'Tempo', 6.8),
      at('c', 'Control', 0),
    ])
    expect(matches[0].fit - matches[1].fit).toBeLessThanOrEqual(ARCHETYPE_TIE_MARGIN)
    expect(deriveArchetype(matches)).toBe('Tempo')
  })

  it('returns null for an empty pool', () => {
    expect(deriveArchetype([])).toBeNull()
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
})
