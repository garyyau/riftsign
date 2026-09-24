import { describe, expect, it } from 'vitest'
import { SCORE_IDS } from './axes'
import { decodeProfile, encodeProfile } from './profile-code'
import type { Profile } from './types'

const sample: Profile = {
  pace: 7.5,
  stance: 3,
  complexity: 10,
  variance: 0,
  fury: 10,
  calm: 0,
  mind: 5,
  body: 5,
  chaos: 2.5,
  order: 7.5,
}

describe('profile code', () => {
  it('encodes a Profile to a fixed string, so links minted today decode forever', () => {
    // 75,30,100,0,100,0,50,50,25,75 as two-character base36 pairs, prefixed by format and Question-set version.
    expect(encodeProfile(sample, 'q1')).toBe('2.q1.230u2s002s001e1e0p23')
  })

  it('decodes that fixed string back to the same Profile and version', () => {
    expect(decodeProfile('2.q1.230u2s002s001e1e0p23')).toEqual({ profile: sample, questionSetVersion: 'q1' })
  })

  it('round-trips every one-decimal Profile', () => {
    let seed = 42
    const next = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
    for (let i = 0; i < 500; i++) {
      const profile = Object.fromEntries(SCORE_IDS.map((id) => [id, Math.round(next() * 100) / 10])) as Profile
      expect(decodeProfile(encodeProfile(profile, 'v2026-11'))?.profile).toEqual(profile)
    }
  })

  it('decodes a format 1 link, splitting each bipolar Domain Axis into its two Domains', () => {
    // Fury/Calm -5, Mind/Body 0, Chaos/Order +2.5: the v1 encoding of this same sample.
    expect(decodeProfile('1.q1.230u2s00001e23')).toEqual({ profile: sample, questionSetVersion: 'q1' })
  })

  it('decodes a real v2 share link minted before the format changed', () => {
    // The v2 (2026-10) "Fury and Chaos brawler" Persona, encoded by the format 1 code on main:
    // pace 9.4, stance 10, complexity 0.8, variance 9.4, Fury/Calm -5, Mind/Body 1.7, Chaos/Order -5.
    expect(decodeProfile('1.2026-10.2m2s082m001v00')).toEqual({
      profile: { pace: 9.4, stance: 10, complexity: 0.8, variance: 9.4, fury: 10, calm: 0, mind: 3.3, body: 6.7, chaos: 10, order: 0 },
      questionSetVersion: '2026-10',
    })
  })

  it('returns null for garbage, unknown formats, wrong lengths and out-of-range scores', () => {
    expect(decodeProfile('')).toBeNull()
    expect(decodeProfile('hello')).toBeNull()
    expect(decodeProfile('3.q1.230u2s002s001e1e0p23')).toBeNull()
    expect(decodeProfile('2.q1.230u2s00001e23')).toBeNull()
    expect(decodeProfile('1.q1.230u2s002s001e1e0p23')).toBeNull()
    expect(decodeProfile('2.q1.zz0u2s002s001e1e0p23')).toBeNull()
    expect(decodeProfile('1.q1.230u2s0000zz23')).toBeNull()
  })

  it('rejects a Question-set version that would break the separator', () => {
    expect(() => encodeProfile(sample, 'a.b')).toThrow()
  })
})
