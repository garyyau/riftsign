import { describe, expect, it } from 'vitest'
import { rankLegends } from './scoring'
import { buildShareUrl, profileFromHash, shareLegendId } from './share'
import { CENTER, legend } from './test-fixtures'

describe('shareLegendId', () => {
  it("names the Legend a recipient sees, ignoring the sharer's favourite champions", () => {
    const profile = { ...CENTER, pace: 10 }
    const pool = [legend('closest', 'Aggro', { pace: 9.9 }), legend('favourite', 'Aggro', { pace: 9.8 })]
    expect(rankLegends(profile, pool, { favouriteChampions: ['favourite'] })[0].legend.id).toBe('favourite')
    expect(shareLegendId(profile, pool)).toBe('closest')
    expect(shareLegendId(profile, [])).toBeNull()
  })
})

describe('share links', () => {
  it('points at the top Legend page and carries the Profile in the fragment', () => {
    const url = buildShareUrl('https://example.github.io', '/riftsign/', CENTER, '2026-09', 'jinx-loose-cannon')
    expect(url).toBe('https://example.github.io/riftsign/r/jinx-loose-cannon/#p=1.2026-09.1e1e1e1e1e1e1e')
  })

  it('falls back to the site root when there is no top Legend', () => {
    expect(buildShareUrl('https://example.test', '/', CENTER, '2026-09', null)).toBe(
      'https://example.test/#p=1.2026-09.1e1e1e1e1e1e1e',
    )
  })

  it('rebuilds the Profile from a shared fragment and ignores anything else', () => {
    expect(profileFromHash('#p=1.2026-09.1e1e1e1e1e1e1e')).toEqual({ profile: CENTER, questionSetVersion: '2026-09' })
    expect(profileFromHash('#p=broken')).toBeNull()
    expect(profileFromHash('')).toBeNull()
  })
})
