import { SCORE_IDS, type DomainId } from './axes'
import type { Profile } from './types'

/**
 * Share-link format. Version 2 (ADR 0005): `2.<questionSetVersion>.<20 base36 chars>`. Each of
 * the ten scores is stored in tenths (0-100) as two base36 characters, in SCORE_IDS order.
 * Anything that changes this layout is a new format version.
 *
 * Version 1 links (seven scores, three bipolar Domain Axes stored as tenths above -5) still decode:
 * an old Fury/Calm score fc becomes fury 5 - fc and calm 5 + fc, and likewise for the other pairs.
 */
const FORMAT_VERSION = '2'
const VERSION_PATTERN = /^[A-Za-z0-9-]+$/
const LEGACY_PAIRS: [DomainId, DomainId][] = [
  ['fury', 'calm'],
  ['mind', 'body'],
  ['chaos', 'order'],
]

export function encodeProfile(profile: Profile, questionSetVersion: string): string {
  if (!VERSION_PATTERN.test(questionSetVersion)) {
    throw new Error(`Question-set version must match ${VERSION_PATTERN}: ${questionSetVersion}`)
  }
  const scores = SCORE_IDS.map((id) => Math.round(profile[id] * 10).toString(36).padStart(2, '0')).join('')
  return `${FORMAT_VERSION}.${questionSetVersion}.${scores}`
}

export interface DecodedProfile {
  profile: Profile
  questionSetVersion: string
}

/** Two-character base36 tenths to scores 0-10, or null if any is out of range. */
function readScores(scores: string): number[] | null {
  const values = (scores.match(/.{2}/g) ?? []).map((pair) => parseInt(pair, 36))
  return values.every((tenths) => tenths <= 100) ? values.map((tenths) => tenths / 10) : null
}

const round1 = (n: number) => Math.round(n * 10) / 10

export function decodeProfile(code: string): DecodedProfile | null {
  const parts = code.split('.')
  if (parts.length !== 3) return null
  const [format, questionSetVersion, scores] = parts
  if (!VERSION_PATTERN.test(questionSetVersion) || !/^[0-9a-z]+$/.test(scores)) return null
  const expected = format === FORMAT_VERSION ? SCORE_IDS.length : format === '1' ? 7 : 0
  if (scores.length !== expected * 2) return null
  const values = readScores(scores)
  if (!values) return null

  if (format === FORMAT_VERSION) {
    return { profile: Object.fromEntries(SCORE_IDS.map((id, i) => [id, values[i]])) as Profile, questionSetVersion }
  }
  const [pace, stance, complexity, variance, ...pairs] = values
  const profile = { pace, stance, complexity, variance } as Profile
  // A stored pair value v (0-10) is the old score fc = v - 5, so the low Domain is 5 - fc and the high one 5 + fc.
  LEGACY_PAIRS.forEach(([low, high], i) => {
    profile[low] = round1(10 - pairs[i])
    profile[high] = pairs[i]
  })
  return { profile, questionSetVersion }
}
