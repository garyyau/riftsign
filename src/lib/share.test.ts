import { describe, expect, it } from 'vitest'
import { buildShareUrl, profileFromHash } from './share'
import { CENTER } from './test-fixtures'

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
