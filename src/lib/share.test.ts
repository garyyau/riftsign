import { describe, expect, it } from 'vitest'
import { buildShareUrl, profileFromHash, shareLegendId } from './share'
import { CENTER, legend } from './test-fixtures'

describe('shareLegendId', () => {
  it('names the top Match, the Legend a recipient sees first', () => {
    const profile = { ...CENTER, pace: 10 }
    const pool = [legend('closest', 'Aggro', { pace: 9.9 }), legend('runner-up', 'Aggro', { pace: 9.8 })]
    expect(shareLegendId(profile, pool)).toBe('closest')
    expect(shareLegendId(profile, [])).toBeNull()
  })
})

describe('share links', () => {
  it('points at the top Legend page and carries the Profile in the fragment', () => {
    const url = buildShareUrl('https://example.github.io', '/riftward/', CENTER, '2026-09', 'jinx-loose-cannon')
    expect(url).toBe('https://example.github.io/riftward/r/jinx-loose-cannon/#p=2.2026-09.1e1e1e1e1e1e1e1e1e1e')
  })

  it('falls back to the site root when there is no top Legend', () => {
    expect(buildShareUrl('https://example.test', '/', CENTER, '2026-09', null)).toBe(
      'https://example.test/#p=2.2026-09.1e1e1e1e1e1e1e1e1e1e',
    )
  })

  it('rebuilds the Profile from a shared fragment, old format included, and ignores anything else', () => {
    expect(profileFromHash('#p=2.2026-09.1e1e1e1e1e1e1e1e1e1e')).toEqual({ profile: CENTER, questionSetVersion: '2026-09' })
    expect(profileFromHash('#p=1.2026-09.1e1e1e1e1e1e1e')).toEqual({ profile: CENTER, questionSetVersion: '2026-09' })
    expect(profileFromHash('#p=broken')).toBeNull()
    expect(profileFromHash('')).toBeNull()
  })
})
