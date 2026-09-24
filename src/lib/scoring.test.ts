import { describe, expect, it } from 'vitest'
import {
  ARCHETYPE_TIE_MARGIN,
  CLOSE_CALL_MARGIN,
  closeCall,
  computeProfile,
  deriveArchetype,
  DOMAIN_HIGHLIGHT_THRESHOLD,
  DOMAIN_PICKS_LIMIT,
  domainFeeling,
  domainPicks,
  favouritePick,
  HEADLINE_MATCHES,
  leadingDomains,
  PLAYSTYLE_GAP_THRESHOLD,
  playstyleGaps,
  rankLegends,
} from './scoring'
import type { Domain } from './axes'
import type { Archetype, Legend, Profile, QuestionSet } from './types'
import { answer, build, CENTER, legend, scenario, smallQuestionSet } from './test-fixtures'

describe('computeProfile', () => {
  it('lands at the midpoint of every score when nothing is answered', () => {
    expect(computeProfile(smallQuestionSet(), {})).toEqual(CENTER)
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

  it('moves both Domains of a zero-sum choice and leaves the Domains it never touches at 5', () => {
    const fury = computeProfile(smallQuestionSet(), { 'domain-1': 'fury' })
    expect([fury.fury, fury.calm, fury.order, fury.mind]).toEqual([10, 0, 5, 5])
    const order = computeProfile(smallQuestionSet(), { 'domain-1': 'order' })
    expect([order.order, order.fury, order.calm, order.chaos]).toEqual([10, 5, 5, 5])
  })

  it('scales a score by the same reach in both directions, so a small penalty stays small', () => {
    const threeWay = scenario(
      'three-way',
      [
        answer('fury', [{ axis: 'fury', weight: 2 }, { axis: 'calm', weight: -1 }, { axis: 'mind', weight: -1 }]),
        answer('calm', [{ axis: 'calm', weight: 2 }, { axis: 'fury', weight: -1 }, { axis: 'mind', weight: -1 }]),
        answer('mind', [{ axis: 'mind', weight: 2 }, { axis: 'fury', weight: -1 }, { axis: 'calm', weight: -1 }]),
        answer('none', []),
      ],
      [
        { axis: 'fury', reverse: false },
        { axis: 'calm', reverse: true },
        { axis: 'mind', reverse: true },
      ],
    )
    const set: QuestionSet = { version: 'test-1', questions: [threeWay] }
    const calm = computeProfile(set, { 'three-way': 'calm' })
    expect([calm.calm, calm.fury, calm.mind]).toEqual([10, 2.5, 2.5])
    expect(computeProfile(set, { 'three-way': 'none' }).fury).toBe(5)
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
  const furyOrderFast: Profile = { ...fastProactive, fury: 10, order: 10 }

  it('clamps playstyle scores to the pool range so an extreme Axis cannot swamp the others', () => {
    // Pace in the pool runs 2..4. A Player at pace 0 is past both Builds; unclamped, that overshoot
    // outweighs the stance gap and 'slow-wrong-stance' wins.
    const clampPool = [
      legend('slow-wrong-stance', 'Control', { pace: 2, stance: 5 }),
      legend('mid-right-stance', 'Midrange', { pace: 4, stance: 8 }),
    ]
    const player: Profile = { ...CENTER, pace: 0, stance: 8 }
    expect(rankLegends(player, clampPool)[0].legend.id).toBe('mid-right-stance')
  })

  it('orders Legends by closeness to the Profile, closest first', () => {
    expect(rankLegends(fastProactive, pool).map((m) => m.legend.id)).toEqual(['exact', 'near', 'far'])
  })

  it('gives an identical Legend a fit of 100 and the opposite corner of everything a fit of 0', () => {
    const [exact] = rankLegends(furyOrderFast, pool)
    expect(exact.fit).toBe(100)
    const opposite = legend('opposite', 'Control', { pace: 0, stance: 0, complexity: 0, variance: 0 }, ['Fury', 'Mind'])
    const top: Profile = { ...CENTER, pace: 10, stance: 10, complexity: 10, variance: 10, fury: 0, mind: 0 }
    // A second Legend at the top corner keeps the pool's range at 0..10, so clamping leaves the Player where they are.
    const corner = legend('corner', 'Aggro', { pace: 10, stance: 10, complexity: 10, variance: 10 })
    const fits = rankLegends(top, [opposite, corner])
    expect(fits.find((m) => m.legend.id === 'opposite')?.fit).toBe(0)
  })

  it('keeps fit stable as the pool grows', () => {
    const before = rankLegends(fastProactive, pool).find((m) => m.legend.id === 'near')!.fit
    const after = rankLegends(fastProactive, [...pool, legend('extra', 'Combo', { complexity: 10 })]).find(
      (m) => m.legend.id === 'near',
    )!.fit
    expect(after).toBe(before)
  })

  const fitOf = (profile: Partial<Profile>, l: Legend) => rankLegends({ ...CENTER, ...profile }, [l])[0].fit

  it('gives a fully neutral Player the same Domain term for every Legend, so playstyle alone decides', () => {
    const pairs: [Domain, Domain][] = [['Fury', 'Order'], ['Calm', 'Mind'], ['Body', 'Chaos'], ['Fury', 'Calm'], ['Mind', 'Body']]
    const sameStyle = pairs.map((domains, i) => legend(`l${i}`, 'Aggro', { pace: 7 }, domains))
    expect(new Set(sameStyle.map((l) => fitOf({}, l))).size).toBe(1)
    const ranked = rankLegends(CENTER, [legend('fury-order', 'Aggro', { pace: 9 }), legend('mind-body', 'Aggro', { pace: 6 }, ['Mind', 'Body'])])
    expect(ranked[0].legend.id).toBe('mind-body')
  })

  it("raises fit steadily as the Player's score for one of the Legend's Domains grows", () => {
    const furyOrder = legend('fury-order', 'Aggro', {})
    const fits = [0, 2.5, 5, 7.5, 10].map((fury) => fitOf({ fury, order: 7 }, furyOrder))
    fits.slice(1).forEach((fit, i) => expect(fit).toBeGreaterThan(fits[i]))
  })

  it('ignores Domains the Legend does not hold', () => {
    const furyOrder = legend('fury-order', 'Aggro', {})
    expect(fitOf({ calm: 0, mind: 10, chaos: 3 }, furyOrder)).toBe(fitOf({}, furyOrder))
  })

  it('scores an opposite-pair Legend on both of its Domains, like any other pair', () => {
    const akali = legend('akali', 'Aggro', {}, ['Fury', 'Calm'])
    const furyOrder = legend('fury-order', 'Aggro', {}, ['Fury', 'Order'])
    // Liking Fury alone: Akali's Calm and Fury/Order's Order are both neutral, so they tie.
    expect(fitOf({ fury: 10 }, akali)).toBe(fitOf({ fury: 10 }, furyOrder))
    // Liking both Fury and Calm favours the Legend that holds both.
    expect(fitOf({ fury: 10, calm: 10 }, akali)).toBeGreaterThan(fitOf({ fury: 10, calm: 10 }, furyOrder))
    // Disliking Calm now costs Akali, which it never did under the bipolar model's nearer-pole rule.
    expect(fitOf({ fury: 10, calm: 0 }, akali)).toBeLessThan(fitOf({ fury: 10, calm: 0 }, furyOrder))
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

describe('domainFeeling', () => {
  it('calls a score a pull or a push only at the highlight threshold from neutral', () => {
    const t = DOMAIN_HIGHLIGHT_THRESHOLD
    expect([5 + t, 5 + t - 0.1, 5, 5 - t + 0.1, 5 - t].map((s) => domainFeeling(s))).toEqual(['pull', 'neutral', 'neutral', 'neutral', 'push'])
  })
})

describe('leadingDomains', () => {
  const lead = (scores: Partial<Profile>) => leadingDomains({ ...CENTER, ...scores })
  const t = DOMAIN_HIGHLIGHT_THRESHOLD

  it('names the top two, strongest first, when both clearly lead', () => {
    expect(lead({ order: 8, fury: 9, mind: 6 })).toEqual(['Fury', 'Order'])
  })

  it('names both Domains of an old opposite pair, since each score is independent', () => {
    expect(lead({ fury: 9, calm: 8 })).toEqual(['Fury', 'Calm'])
  })

  it('names only the top one when the second is not a pull', () => {
    expect(lead({ fury: 9, order: 5 + t - 0.1 })).toEqual(['Fury'])
  })

  it('names none when nothing reaches the threshold, however the scores rank', () => {
    expect(lead({})).toEqual([])
    expect(lead({ fury: 5 + t - 0.1 })).toEqual([])
    expect(lead({ calm: 0, mind: 0, body: 0, chaos: 0, order: 0 })).toEqual([])
  })

  it('leaves out Domains tied at the cut rather than picking one arbitrarily', () => {
    expect(lead({ fury: 9, order: 8, chaos: 8 })).toEqual(['Fury'])
    expect(lead({ fury: 8, order: 8, chaos: 8 })).toEqual([])
    expect(lead({ fury: 8, order: 8, chaos: 6 })).toEqual(['Fury', 'Order'])
  })
})

describe('domainPicks', () => {
  const pool = [
    legend('head-1', 'Aggro', { pace: 10 }, ['Fury', 'Order']),
    legend('head-2', 'Aggro', { pace: 9.9 }, ['Fury', 'Order']),
    legend('order-fury', 'Midrange', { pace: 6 }, ['Order', 'Fury']),
    legend('fury-order', 'Aggro', { pace: 8 }, ['Fury', 'Order']),
    legend('fury-chaos', 'Aggro', { pace: 9 }, ['Fury', 'Chaos']),
    legend('calm-order', 'Control', { pace: 0 }, ['Calm', 'Order']),
  ]
  const picksFor = (scores: Partial<Profile>) => {
    const profile = { ...CENTER, pace: 10, ...scores }
    return domainPicks(profile, rankLegends(profile, pool))
  }

  it('lists Legends holding the leading pair in fit order, skipping the headline Matches', () => {
    const picks = picksFor({ fury: 9, order: 8 })
    expect(picks.domains).toEqual(['Fury', 'Order'])
    expect(picks.matches.map((m) => m.legend.id)).toEqual(['fury-order', 'order-fury'])
    expect(HEADLINE_MATCHES).toBe(2)
  })

  it('lists Legends holding the one leading Domain when only one leads', () => {
    expect(picksFor({ fury: 9 }).matches.map((m) => m.legend.id)).toEqual(['fury-chaos', 'fury-order', 'order-fury'])
  })

  it('lists nothing when no Domain leads', () => {
    expect(picksFor({})).toEqual({ domains: [], matches: [] })
  })

  it('stops at the limit', () => {
    const many = Array.from({ length: DOMAIN_PICKS_LIMIT + 4 }, (_, i) => legend(`f${i}`, 'Aggro', { pace: i }, ['Fury', 'Body']))
    const profile = { ...CENTER, fury: 10 }
    expect(domainPicks(profile, rankLegends(profile, many)).matches).toHaveLength(DOMAIN_PICKS_LIMIT)
  })
})

describe('favouritePick', () => {
  const pool = [legend('shown', 'Aggro', { pace: 10 }), legend('jinx', 'Aggro', { pace: 8 }), legend('jinx-2', 'Aggro', { pace: 2 }, undefined, { champion: 'jinx' })]
  const matches = rankLegends({ ...CENTER, pace: 10 }, pool)

  it("picks the best-fitting Legend of the Player's favourite champions that the page has not shown", () => {
    expect(favouritePick(matches, ['jinx'], [pool[0]])?.legend.id).toBe('jinx')
    expect(favouritePick(matches, ['jinx'], [pool[1]])?.legend.id).toBe('jinx-2')
  })

  it('returns null when every favourite is already shown, or none is named', () => {
    expect(favouritePick(matches, ['shown'], [pool[0]])).toBeNull()
    expect(favouritePick(matches, [], [])).toBeNull()
  })
})

describe('playstyleGaps', () => {
  it('names the Axes where the Build sits a band or more from the Player, biggest gap first, signed', () => {
    const b = build('Aggro', { pace: 9, stance: 5 + PLAYSTYLE_GAP_THRESHOLD - 0.1, complexity: 1, variance: 5 })
    expect(playstyleGaps({ ...CENTER, pace: 4 }, b)).toEqual([
      { axis: 'pace', gap: 5 },
      { axis: 'complexity', gap: -4 },
    ])
    expect(playstyleGaps(CENTER, build('Aggro', {}))).toEqual([])
  })
})
