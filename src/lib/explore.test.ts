import { describe, expect, it } from 'vitest'
import { LEGENDS } from '@/data'
import { SCORE_IDS } from './axes'
import { axisGapLabel, buildFits, defaultExploreId, exploreStrip, gapSummary } from './explore'
import { rankLegends } from './scoring'
import { build, CENTER, legend } from './test-fixtures'
import type { Profile } from './types'

// A fixed spread of Profiles, including extremes that get clamped to the pool.
const profiles: Profile[] = [0, 1.5, 3, 5, 7.2, 10].flatMap((v, i) =>
  [0, 1].map((flip) => Object.fromEntries(SCORE_IDS.map((id, j) => [id, (j + i + flip) % 2 ? v : 10 - v])) as Profile),
)

describe('buildFits', () => {
  it("puts the Match's Build first with the Match's fit, for every real Legend", () => {
    for (const profile of profiles) {
      for (const match of rankLegends(profile, LEGENDS)) {
        const [best] = buildFits(profile, match.legend, LEGENDS)
        expect(best.build).toBe(match.build)
        expect(best.fit).toBe(match.fit)
      }
    }
  })

  it('scores every reviewed Build, best first, and skips unreviewed ones', () => {
    const lux = legend('lux', 'Control', {}, undefined, {
      builds: [build('Control', { pace: 1 }), build('Combo', { pace: 9 }), build('Aggro', { pace: 10 }, { reviewed: false })],
    })
    const fits = buildFits({ ...CENTER, pace: 9 }, lux, [lux])
    expect(fits.map((f) => f.build.archetype)).toEqual(['Combo', 'Control'])
    expect(fits[0].fit).toBeGreaterThan(fits[1].fit)
  })
})

describe('defaultExploreId', () => {
  const matches = rankLegends({ ...CENTER, pace: 10 }, [
    legend('a', 'Aggro', { pace: 10 }),
    legend('b', 'Aggro', { pace: 8 }),
    legend('c', 'Tempo', { pace: 6 }),
  ])

  it('skips Legends already shown', () => {
    expect(defaultExploreId(matches, ['a', 'b'])).toBe('c')
    expect(defaultExploreId(matches, [])).toBe('a')
  })

  it('falls back to the top Match when every Legend is shown', () => {
    expect(defaultExploreId(matches, ['a', 'b', 'c'])).toBe('a')
    expect(defaultExploreId([], [])).toBeUndefined()
  })
})

describe('exploreStrip', () => {
  const matches = rankLegends({ ...CENTER, pace: 10 }, [
    legend('zed', 'Aggro', { pace: 10 }),
    legend('ahri', 'Tempo', { pace: 7 }),
    legend('master-yi', 'Control', { pace: 2 }, undefined, { name: 'Master Yi, Wuju Master', champion: 'Master Yi' }),
  ])
  const view = (sort: 'fit' | 'name', query = '') => exploreStrip(matches, sort, query).map((r) => `${r.rank} ${r.match.legend.id}`)

  it('keeps fit ranks under either sort', () => {
    expect(view('fit')).toEqual(['1 zed', '2 ahri', '3 master-yi'])
    expect(view('name')).toEqual(['2 ahri', '3 master-yi', '1 zed'])
  })

  it('filters by name or champion, ignoring case, without changing ranks', () => {
    expect(view('fit', '  WUJU ')).toEqual(['3 master-yi'])
    expect(view('fit', 'master yi')).toEqual(['3 master-yi'])
    expect(view('fit', 'nobody')).toEqual([])
  })
})

describe('axisGapLabel', () => {
  it('names the difference to one decimal with its direction', () => {
    expect(axisGapLabel('pace', 5, 5.3)).toBe('0.3 faster')
    expect(axisGapLabel('stance', 6, 5.3)).toBe('0.7 more reactive')
    expect(axisGapLabel('complexity', 6.1, 4)).toBe('2.1 simpler')
  })

  it('says About the same when the gap rounds to 0.0', () => {
    expect(axisGapLabel('variance', 5, 5.04)).toBe('About the same')
    expect(axisGapLabel('variance', 5.04, 5)).toBe('About the same')
    expect(axisGapLabel('variance', 5, 5.1)).toBe('0.1 swingier')
  })
})

describe('gapSummary', () => {
  it('reads close when no Axis is a band apart', () => {
    expect(gapSummary(CENTER, build('Midrange', { pace: 6.9 }), false)).toBe('It plays close to how you like to play.')
    expect(gapSummary(CENTER, build('Midrange', {}), true)).toBe('It plays close to how they like to play.')
  })

  it('names at most the two biggest gaps', () => {
    const b = build('Aggro', { pace: 9, variance: 8, complexity: 2.5 })
    expect(gapSummary(CENTER, b, false)).toBe("It's faster and swingier than you like.")
    expect(gapSummary(CENTER, b, true)).toBe("It's faster and swingier than they like.")
  })
})
