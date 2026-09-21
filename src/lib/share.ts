import { decodeProfile, encodeProfile, type DecodedProfile } from './profile-code'
import type { Profile } from './types'

const HASH_KEY = 'p'

/** Reads a shared Profile from a `#p=<code>` fragment. */
export function profileFromHash(hash: string): DecodedProfile | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const code = params.get(HASH_KEY)
  return code ? decodeProfile(code) : null
}

export function hashForProfile(code: string): string {
  return `#${HASH_KEY}=${code}`
}

/**
 * Share links point at the top Match's static page (`r/<legendId>/`) so chat previews show
 * that Legend's image, and carry the Profile in the fragment so the page can rebuild the result.
 */
export function buildShareUrl(
  origin: string,
  base: string,
  profile: Profile,
  questionSetVersion: string,
  topLegendId: string | null,
): string {
  const code = encodeProfile(profile, questionSetVersion)
  const root = `${origin}${base.endsWith('/') ? base : `${base}/`}`
  const path = topLegendId ? `r/${topLegendId}/` : ''
  return `${root}${path}${hashForProfile(code)}`
}
