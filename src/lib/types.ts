import type { AxisId, Domain, PlaystyleAxisId } from './axes'

export const ARCHETYPES = ['Aggro', 'Tempo', 'Midrange', 'Control', 'Combo'] as const
export type Archetype = (typeof ARCHETYPES)[number]

export const SET_CODES = ['OGN', 'OGS', 'SFD', 'UNL', 'VEN', 'RAD'] as const
export type SetCode = (typeof SET_CODES)[number]

/** The Player's position on all seven Axes, in each Axis's presentation units. */
export type Profile = Record<AxisId, number>

/** Where a Build sits on the four playstyle Axes. Its Domains come from the Legend. */
export type BuildCoordinates = Record<PlaystyleAxisId, number>

export interface AxisMove {
  axis: AxisId
  /** Signed weight. Positive moves toward the Axis's high pole. */
  weight: number
}

export interface Answer {
  id: string
  text: string
  moves: AxisMove[]
}

export interface AxisLoading {
  axis: AxisId
  /** True when agreeing / the "obvious" answer moves toward the LOW pole. */
  reverse: boolean
}

export type Question =
  | {
      id: string
      kind: 'scenario'
      /** Short Axis-neutral eyebrow label shown in the step rail, e.g. "At the table". */
      eyebrow: string
      prompt: string
      loads: AxisLoading[]
      answers: Answer[]
      /** Shows the two Answers as poles of a four-point scale: strong and leaning on each side. */
      scale?: boolean
    }
  | {
      id: string
      kind: 'statement'
      eyebrow: string
      prompt: string
      loads: AxisLoading[]
      /** Movement applied at "strongly agree"; scaled -1..1 across the five points. */
      agreeMoves: AxisMove[]
    }

export interface QuestionSet {
  /** Bumped by hand when Question content changes; stored in share links and local storage. */
  version: string
  questions: Question[]
}

/** questionId -> chosen answerId. Missing keys are unanswered. */
export type Answers = Record<string, string>

/** A Legend has at most this many Builds. Extra Builds are added only when players actually run them. */
export const MAX_BUILDS = 3

/** One played way of piloting a Legend: an Archetype with its own Axis position and copy. */
export interface Build {
  archetype: Archetype
  coordinates: BuildCoordinates
  howItPlays: string
  whyYou: string
  guideUrls: string[]
  deckListUrl: string
  reviewed: boolean
  ratingNotes: string
}

export interface Legend {
  id: string
  name: string
  champion: string
  domains: [Domain, Domain]
  set: SetCode
  /** Retail product name, or null when no starter deck exists. */
  starterDeck: string | null
  cardImage: string
  ingestedAt: string
  /** 1 to MAX_BUILDS, each a different Archetype. */
  builds: Build[]
}

export interface Match {
  legend: Legend
  /** The Legend's reviewed Build closest to the Profile. */
  build: Build
  /** 0-100. Higher is closer. */
  fit: number
}

export interface DomainLean {
  /** The two Domain Axes with the largest magnitude, strongest first. */
  axes: [AxisId, AxisId]
  /** The Domains those Axes point to. An Axis nearer 0 than DOMAIN_LEAN_THRESHOLD contributes none. */
  domains: Domain[]
  legends: Legend[]
}
