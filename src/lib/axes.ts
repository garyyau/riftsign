/**
 * The ten Profile scores (ADR 0005): four playstyle Axes and six independent Domain scores.
 * Frozen once launched: the share URL encodes scores in this order, so changing this list is a
 * new major version.
 */
export const PLAYSTYLE_AXIS_IDS = ['pace', 'stance', 'complexity', 'variance'] as const
export const DOMAIN_IDS = ['fury', 'calm', 'mind', 'body', 'chaos', 'order'] as const
export const SCORE_IDS = [...PLAYSTYLE_AXIS_IDS, ...DOMAIN_IDS] as const

export type PlaystyleAxisId = (typeof PLAYSTYLE_AXIS_IDS)[number]
export type DomainId = (typeof DOMAIN_IDS)[number]
export type ScoreId = (typeof SCORE_IDS)[number]

/** Display names, in the same order as DOMAIN_IDS. */
export const DOMAINS = ['Fury', 'Calm', 'Mind', 'Body', 'Chaos', 'Order'] as const
export type Domain = (typeof DOMAINS)[number]

export const DOMAIN_ID: Record<Domain, DomainId> = {
  Fury: 'fury',
  Calm: 'calm',
  Mind: 'mind',
  Body: 'body',
  Chaos: 'chaos',
  Order: 'order',
}

/** Every score runs 0 to 10. On a Domain score, 5 means no feeling either way. */
export const SCORE_MAX = 10
export const SCORE_MID = 5

export function isDomainId(id: ScoreId): id is DomainId {
  return (DOMAIN_IDS as readonly string[]).includes(id)
}

export interface AxisDefinition {
  id: PlaystyleAxisId
  name: string
  /** Player-facing question the Axis answers, e.g. "How quickly you want the game decided." */
  blurb: string
  lowLabel: string
  highLabel: string
  /** Band labels from lowest to highest; five equal-width bands across 0 to 10. */
  bands: readonly [string, string, string, string, string]
}

const playstyle = (
  id: PlaystyleAxisId,
  name: string,
  blurb: string,
  low: string,
  high: string,
  middle: string,
): AxisDefinition => ({
  id,
  name,
  blurb,
  lowLabel: low,
  highLabel: high,
  bands: [`strongly ${low}`, `leaning ${low}`, middle, `leaning ${high}`, `strongly ${high}`],
})

export const AXES: Record<PlaystyleAxisId, AxisDefinition> = {
  pace: playstyle('pace', 'Pace', 'How quickly you want the game decided.', 'slow', 'fast', 'even-paced'),
  stance: playstyle(
    'stance',
    'Stance',
    'Whether you set the agenda or answer your opponent.',
    'reactive',
    'proactive',
    'flexible',
  ),
  complexity: playstyle(
    'complexity',
    'Complexity',
    'How many moving parts you enjoy managing, from combos built over several turns to tracking hidden cards.',
    'simple',
    'intricate',
    'moderate',
  ),
  variance: playstyle(
    'variance',
    'Variance',
    'How much you enjoy luck, gambles and all-or-nothing swings.',
    'steady',
    'swingy',
    'measured',
  ),
}

/** Normalises a 0-10 score to [0, 1] so distances compare across Axes. */
export function normalize(value: number): number {
  return value / SCORE_MAX
}

/** Index 0-4 of the band a playstyle score falls in. Top edge belongs to the last band. */
export function bandIndex(value: number): number {
  return Math.min(4, Math.max(0, Math.floor(normalize(value) * 5)))
}

export function bandLabel(axis: PlaystyleAxisId, value: number): string {
  return AXES[axis].bands[bandIndex(value)]
}
