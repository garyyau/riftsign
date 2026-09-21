import { AXES, AXIS_IDS } from './axes'
import type { Profile } from './types'

/**
 * Share-link format. Version 1: `1.<questionSetVersion>.<14 base36 chars>`.
 * Each Axis is stored as tenths above its minimum (0-100) in two base36 characters, in
 * AXIS_IDS order. Anything that changes this layout is a new format version.
 */
const FORMAT_VERSION = '1'
const VERSION_PATTERN = /^[A-Za-z0-9-]+$/

export function encodeProfile(profile: Profile, questionSetVersion: string): string {
  if (!VERSION_PATTERN.test(questionSetVersion)) {
    throw new Error(`Question-set version must match ${VERSION_PATTERN}: ${questionSetVersion}`)
  }
  const scores = AXIS_IDS.map((axis) => {
    const tenths = Math.round((profile[axis] - AXES[axis].min) * 10)
    return tenths.toString(36).padStart(2, '0')
  }).join('')
  return `${FORMAT_VERSION}.${questionSetVersion}.${scores}`
}

export interface DecodedProfile {
  profile: Profile
  questionSetVersion: string
}

export function decodeProfile(code: string): DecodedProfile | null {
  const parts = code.split('.')
  if (parts.length !== 3) return null
  const [format, questionSetVersion, scores] = parts
  if (format !== FORMAT_VERSION || !VERSION_PATTERN.test(questionSetVersion)) return null
  if (scores.length !== AXIS_IDS.length * 2 || !/^[0-9a-z]+$/.test(scores)) return null

  const profile = {} as Profile
  for (const [i, axis] of AXIS_IDS.entries()) {
    const tenths = parseInt(scores.slice(i * 2, i * 2 + 2), 36)
    const span = (AXES[axis].max - AXES[axis].min) * 10
    if (tenths > span) return null
    profile[axis] = Math.round(AXES[axis].min * 10 + tenths) / 10 + 0
  }
  return { profile, questionSetVersion }
}
