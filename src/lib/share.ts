import { decodeProfile, encodeProfile, type DecodedProfile } from './profile-code'
import { rankLegends } from './scoring'
import type { Legend, Profile } from './types'

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

/** The Legend a share link's preview should name: the top Match, which the recipient sees first too. */
export function shareLegendId(profile: Profile, pool: Legend[]): string | null {
  return rankLegends(profile, pool)[0]?.legend.id ?? null
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
