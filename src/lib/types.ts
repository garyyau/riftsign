import type { Domain, PlaystyleAxisId, ScoreId } from './axes'

export const ARCHETYPES = ['Aggro', 'Tempo', 'Midrange', 'Control', 'Combo'] as const
export type Archetype = (typeof ARCHETYPES)[number]

export const SET_CODES = ['OGN', 'OGS', 'SFD', 'UNL', 'VEN', 'RAD'] as const
export type SetCode = (typeof SET_CODES)[number]

/** The Player's ten scores, each 0 to 10: four playstyle Axes and six Domain scores. */
export type Profile = Record<ScoreId, number>

/** Where a Build sits on the four playstyle Axes. Its Domains come from the Legend. */
export type BuildCoordinates = Record<PlaystyleAxisId, number>

export interface ScoreMove {
  /** A score id: a playstyle Axis or a Domain. Named axis so Question files read the same as before. */
  axis: ScoreId
  /** Signed weight. Positive moves the score up. */
  weight: number
}

export interface Answer {
  id: string
  text: string
  moves: ScoreMove[]
}

export interface ScoreLoading {
  axis: ScoreId
  /** True when agreeing / the "obvious" answer moves the score down. */
  reverse: boolean
}

export type Question =
  | {
      id: string
      kind: 'scenario'
      /** Short Axis-neutral eyebrow label shown in the step rail, e.g. "At the table". */
      eyebrow: string
      prompt: string
      loads: ScoreLoading[]
      answers: Answer[]
      /** Shows the two Answers as poles of a four-point scale: strong and leaning on each side. */
      scale?: boolean
    }
  | {
      id: string
      kind: 'statement'
      eyebrow: string
      prompt: string
      loads: ScoreLoading[]
      /** Movement applied at "strongly agree"; scaled -1..1 across the five points. */
      agreeMoves: ScoreMove[]
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

/** The "Your Domains" section of the result page. */
export interface DomainPicks {
  /** The one or two Domains that clearly lead the Profile, strongest first. Empty when none does. */
  domains: Domain[]
  /** Matches holding every leading Domain, best fit first, without the headline Matches. */
  matches: Match[]
}
