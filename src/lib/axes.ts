/**
 * The seven Axes fixed for v1 (ADR 0001). Frozen once launched: the share URL
 * encodes scores in this order, so changing this list is a new major version.
 */
export const PLAYSTYLE_AXIS_IDS = ['pace', 'stance', 'complexity', 'variance'] as const
export const DOMAIN_AXIS_IDS = ['fury-calm', 'mind-body', 'chaos-order'] as const
export const AXIS_IDS = [...PLAYSTYLE_AXIS_IDS, ...DOMAIN_AXIS_IDS] as const

export type PlaystyleAxisId = (typeof PLAYSTYLE_AXIS_IDS)[number]
export type DomainAxisId = (typeof DOMAIN_AXIS_IDS)[number]
export type AxisId = (typeof AXIS_IDS)[number]

export const DOMAINS = ['Fury', 'Calm', 'Mind', 'Body', 'Chaos', 'Order'] as const
export type Domain = (typeof DOMAINS)[number]

export interface AxisDefinition {
  id: AxisId
  kind: 'playstyle' | 'domain'
  name: string
  /** Player-facing question the Axis answers, e.g. "How fast do you want games to go?" */
  blurb: string
  min: number
  max: number
  /** Label at the low end of the Axis. For Domain Axes this is a Domain name. */
  lowLabel: string
  highLabel: string
  /** Band labels from lowest to highest; five equal-width bands across [min, max]. */
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
  kind: 'playstyle',
  name,
  blurb,
  min: 0,
  max: 10,
  lowLabel: low,
  highLabel: high,
  bands: [`strongly ${low}`, `leaning ${low}`, middle, `leaning ${high}`, `strongly ${high}`],
})

const domain = (id: DomainAxisId, low: Domain, high: Domain, blurb: string): AxisDefinition => ({
  id,
  kind: 'domain',
  name: `${low} / ${high}`,
  blurb,
  min: -5,
  max: 5,
  lowLabel: low,
  highLabel: high,
  bands: [`strongly ${low}`, `leaning ${low}`, 'balanced', `leaning ${high}`, `strongly ${high}`],
})

export const AXES: Record<AxisId, AxisDefinition> = {
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
    'How many moving parts you enjoy managing.',
    'simple',
    'intricate',
    'moderate',
  ),
  variance: playstyle(
    'variance',
    'Variance',
    'How much you enjoy swings, gambles and big turns.',
    'steady',
    'swingy',
    'measured',
  ),
  'fury-calm': domain('fury-calm', 'Fury', 'Calm', 'Raw aggression versus patient precision.'),
  'mind-body': domain('mind-body', 'Mind', 'Body', 'Tricks and knowledge versus muscle and units.'),
  'chaos-order': domain('chaos-order', 'Chaos', 'Order', 'Gambles and disruption versus structure and rules.'),
}

/** Maps a Domain to the Axis it sits on and the pole value (-5 or +5) it points to. */
export const DOMAIN_POLES: Record<Domain, { axis: DomainAxisId; value: -5 | 5 }> = {
  Fury: { axis: 'fury-calm', value: -5 },
  Calm: { axis: 'fury-calm', value: 5 },
  Mind: { axis: 'mind-body', value: -5 },
  Body: { axis: 'mind-body', value: 5 },
  Chaos: { axis: 'chaos-order', value: -5 },
  Order: { axis: 'chaos-order', value: 5 },
}

export function isDomainAxis(id: AxisId): id is DomainAxisId {
  return (DOMAIN_AXIS_IDS as readonly string[]).includes(id)
}

/** Normalizes a score on its Axis to [0, 1] so distances compare across Axes. */
export function normalize(axis: AxisId, value: number): number {
  const { min, max } = AXES[axis]
  return (value - min) / (max - min)
}

/** Index 0-4 of the band a score falls in. Top edge belongs to the last band. */
export function bandIndex(axis: AxisId, value: number): number {
  const { min, max } = AXES[axis]
  const t = (value - min) / (max - min)
  return Math.min(4, Math.max(0, Math.floor(t * 5)))
}

export function bandLabel(axis: AxisId, value: number): string {
  return AXES[axis].bands[bandIndex(axis, value)]
}
