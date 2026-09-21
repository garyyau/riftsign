import type { Domain } from './axes'
import type { Answer, Archetype, Legend, Profile, Question, QuestionSet } from './types'

export function scenario(id: string, answers: Answer[], loads: Question['loads']): Question {
  return { id, kind: 'scenario', eyebrow: 'At the table', prompt: `Prompt ${id}`, loads, answers }
}

export function answer(id: string, moves: Answer['moves']): Answer {
  return { id, text: `Answer ${id}`, moves }
}

/** A small Question set: three scenario Questions per playstyle Axis, one reverse-keyed, plus Domain Questions. */
export function smallQuestionSet(): QuestionSet {
  return {
    version: 'test-1',
    questions: [
      scenario('pace-1', [answer('fast', [{ axis: 'pace', weight: 2 }]), answer('slow', [{ axis: 'pace', weight: -2 }])], [
        { axis: 'pace', reverse: false },
      ]),
      scenario('pace-2', [answer('fast', [{ axis: 'pace', weight: 1 }]), answer('slow', [{ axis: 'pace', weight: -1 }])], [
        { axis: 'pace', reverse: false },
      ]),
      scenario('pace-3', [answer('slow', [{ axis: 'pace', weight: -2 }]), answer('fast', [{ axis: 'pace', weight: 2 }])], [
        { axis: 'pace', reverse: true },
      ]),
      scenario(
        'stance-1',
        [answer('lead', [{ axis: 'stance', weight: 2 }]), answer('wait', [{ axis: 'stance', weight: -2 }])],
        [{ axis: 'stance', reverse: false }],
      ),
      scenario(
        'domain-1',
        [
          answer('fury', [{ axis: 'fury-calm', weight: -2 }]),
          answer('calm', [{ axis: 'fury-calm', weight: 2 }]),
          answer('order', [{ axis: 'chaos-order', weight: 2 }]),
        ],
        [{ axis: 'fury-calm', reverse: false }],
      ),
    ],
  }
}

export const CENTER: Profile = {
  pace: 5,
  stance: 5,
  complexity: 5,
  variance: 5,
  'fury-calm': 0,
  'mind-body': 0,
  'chaos-order': 0,
}

export function legend(
  id: string,
  archetype: Archetype,
  coords: Partial<Profile>,
  domains: [Domain, Domain] = ['Fury', 'Order'],
  extra: Partial<Legend> = {},
): Legend {
  return {
    id,
    name: `${id}, Test Legend`,
    champion: id,
    domains,
    set: 'OGN',
    starterDeck: null,
    archetype,
    coordinates: { ...CENTER, ...coords },
    howItPlays: 'Plays cards. Wins games.',
    whyYou: 'You like winning.',
    guideUrls: [],
    cardImage: `${id}.jpg`,
    deckListUrl: `https://piltoverarchive.com/decks?legend=${id}`,
    reviewed: true,
    ingestedAt: '2026-09-20',
    ratingNotes: '',
    ...extra,
  }
}
