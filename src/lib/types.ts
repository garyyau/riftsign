import type { AxisId, Domain } from './axes'

export const ARCHETYPES = ['Aggro', 'Tempo', 'Midrange', 'Control', 'Combo'] as const
export type Archetype = (typeof ARCHETYPES)[number]

export const SET_CODES = ['OGN', 'OGS', 'SFD', 'UNL', 'VEN', 'RAD'] as const
export type SetCode = (typeof SET_CODES)[number]

/** The Player's position on all seven Axes, in each Axis's presentation units. */
export type Profile = Record<AxisId, number>

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

export interface Legend {
  id: string
  name: string
  champion: string
  domains: [Domain, Domain]
  set: SetCode
  /** Retail product name, or null when no starter deck exists. */
  starterDeck: string | null
  archetype: Archetype
  coordinates: Profile
  howItPlays: string
  whyYou: string
  guideUrls: string[]
  cardImage: string
  deckListUrl: string
  reviewed: boolean
  ingestedAt: string
  ratingNotes: string
}

export interface Match {
  legend: Legend
  /** 0-100. Higher is closer. */
  fit: number
}

export interface DomainLean {
  axes: [AxisId, AxisId]
  domains: [Domain, Domain]
  legends: Legend[]
}
