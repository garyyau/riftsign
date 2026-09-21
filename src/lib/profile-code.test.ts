import { describe, expect, it } from 'vitest'
import { decodeProfile, encodeProfile } from './profile-code'
import type { Profile } from './types'

const sample: Profile = {
  pace: 7.5,
  stance: 3,
  complexity: 10,
  variance: 0,
  'fury-calm': -5,
  'mind-body': 0,
  'chaos-order': 2.5,
}

describe('profile code', () => {
  it('encodes a v1 Profile to a fixed string, so links minted today decode forever', () => {
    // 75,30,100,0,0,50,75 as two-character base36 pairs, prefixed by format and Question-set version.
    expect(encodeProfile(sample, 'q1')).toBe('1.q1.230u2s00001e23')
  })

  it('decodes that fixed string back to the same Profile and version', () => {
    expect(decodeProfile('1.q1.230u2s00001e23')).toEqual({ profile: sample, questionSetVersion: 'q1' })
  })

  it('round-trips every one-decimal Profile', () => {
    let seed = 42
    const next = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
    for (let i = 0; i < 500; i++) {
      const profile: Profile = {
        pace: Math.round(next() * 100) / 10,
        stance: Math.round(next() * 100) / 10,
        complexity: Math.round(next() * 100) / 10,
        variance: Math.round(next() * 100) / 10,
        'fury-calm': Math.round(next() * 100 - 50) / 10 + 0,
        'mind-body': Math.round(next() * 100 - 50) / 10 + 0,
        'chaos-order': Math.round(next() * 100 - 50) / 10 + 0,
      }
      expect(decodeProfile(encodeProfile(profile, 'v2026-09'))?.profile).toEqual(profile)
    }
  })

  it('returns null for garbage, unknown formats, and out-of-range scores', () => {
    expect(decodeProfile('')).toBeNull()
    expect(decodeProfile('hello')).toBeNull()
    expect(decodeProfile('2.q1.230u2s00001e23')).toBeNull()
    expect(decodeProfile('1.q1.230u2s00001e')).toBeNull()
    expect(decodeProfile('1.q1.zz0u2s00001e23')).toBeNull()
  })

  it('rejects a Question-set version that would break the separator', () => {
    expect(() => encodeProfile(sample, 'a.b')).toThrow()
  })
})
