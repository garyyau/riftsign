/**
 * Persona fixtures (spec 0001, quality gates). Seven fixed Answer sets against the committed
 * Questions and Legends. If a Question or rating edit moves a Persona to the wrong Archetype,
 * this fails the build. Personas are never shown to Players.
 *
 * Each set answers the Questions as that kind of player honestly would, using a scale's
 * "-leaning" point wherever they would be lukewarm rather than picking the pole that scores best.
 */
import { describe, expect, it } from 'vitest'
import { ALL_LEGENDS, QUESTION_SET } from '@/data'
import type { AxisId } from './axes'
import { answersOf, computeProfile, deriveArchetype, domainLean, rankLegends } from './scoring'
import type { Answers, Archetype } from './types'

// The seed pool is unreviewed until Ingestion approves it; the fixtures still need to rank against it.
const pool = ALL_LEGENDS.map((l) => ({ ...l, builds: l.builds.map((b) => ({ ...b, reviewed: true })) }))

interface Persona {
  name: string
  answers: Answers
  archetype: Archetype
  dominantDomainAxes?: [AxisId, AxisId]
}

const PERSONAS: Persona[] = [
  {
    name: 'impatient aggro player',
    archetype: 'Aggro',
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage',
      'units-or-answers': 'units',
      'tokens-or-trash': 'tokens-leaning',
      'cut-one-card': 'cut-steady-leaning',
      'draw-or-ramp': 'rune-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'which-win': 'turn-four',
      'hold-or-press': 'press',
      'discard-or-sacrifice': 'discard-leaning',
      'all-in-or-measured': 'all-in',
      'hold-or-spend': 'spend',
      'biggest-card': 'huge-unit',
      'card-order': 'barely-matters-leaning',
      'behind-early': 'itchy',
      'protector-or-striker': 'striker',
      'token-or-face-down': 'tokens-on-death-leaning',
      'best-days': 'agree',
      'shrink-or-buff': 'buff',
      'shutting-down': 'disagree',
      'quick-games': 'strongly-agree',
      'move-or-attack': 'attack',
      'formation-or-tricks': 'bag-of-tricks-leaning',
      'one-clear-job': 'agree',
      'edge-hand-or-board': 'board',
      'finisher-or-spread': 'spread-leaning',
    },
  },
  {
    name: 'tricky tempo player',
    archetype: 'Tempo',
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage-leaning',
      'units-or-answers': 'units-leaning',
      'tokens-or-trash': 'trash-leaning',
      'cut-one-card': 'cut-bomb-leaning',
      'draw-or-ramp': 'draw-leaning',
      'reading-their-hand': 'work-it-out-leaning',
      'which-win': 'turn-four-leaning',
      'hold-or-press': 'press-leaning',
      'discard-or-sacrifice': 'discard-leaning',
      'all-in-or-measured': 'measured-leaning',
      'hold-or-spend': 'spend-leaning',
      'biggest-card': 'gear-leaning',
      'card-order': 'enjoy-order',
      'behind-early': 'itchy-leaning',
      'protector-or-striker': 'striker-leaning',
      'token-or-face-down': 'face-down',
      'best-days': 'neutral',
      'shrink-or-buff': 'shrink-leaning',
      'shutting-down': 'disagree',
      'quick-games': 'agree',
      'move-or-attack': 'attack-leaning',
      'formation-or-tricks': 'bag-of-tricks',
      'one-clear-job': 'disagree',
      'edge-hand-or-board': 'hand-leaning',
      'finisher-or-spread': 'spread-leaning',
    },
  },
  {
    name: 'steady midrange player',
    archetype: 'Midrange',
    answers: {
      'first-turn': 'ramp-leaning',
      'damage-or-stun': 'stun-leaning',
      'units-or-answers': 'units-leaning',
      'tokens-or-trash': 'tokens-leaning',
      'cut-one-card': 'cut-bomb',
      'draw-or-ramp': 'rune-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'which-win': 'turn-nine-leaning',
      'hold-or-press': 'hold-leaning',
      'discard-or-sacrifice': 'sacrifice-leaning',
      'all-in-or-measured': 'measured',
      'hold-or-spend': 'spend-leaning',
      'biggest-card': 'huge-unit-leaning',
      'card-order': 'barely-matters-leaning',
      'behind-early': 'relaxed-leaning',
      'protector-or-striker': 'protector-leaning',
      'token-or-face-down': 'tokens-on-death-leaning',
      'best-days': 'disagree',
      'shrink-or-buff': 'buff-leaning',
      'shutting-down': 'neutral',
      'quick-games': 'disagree',
      'move-or-attack': 'move-it-leaning',
      'formation-or-tricks': 'formation-leaning',
      'one-clear-job': 'agree',
      'edge-hand-or-board': 'board-leaning',
      'finisher-or-spread': 'spread',
    },
  },
  {
    name: 'patient control player',
    archetype: 'Control',
    answers: {
      'first-turn': 'ramp',
      'damage-or-stun': 'stun-leaning',
      'units-or-answers': 'answers',
      'tokens-or-trash': 'trash-leaning',
      'cut-one-card': 'cut-bomb-leaning',
      'draw-or-ramp': 'draw',
      'reading-their-hand': 'work-it-out-leaning',
      'which-win': 'turn-nine',
      'hold-or-press': 'hold',
      'discard-or-sacrifice': 'sacrifice-leaning',
      'all-in-or-measured': 'measured',
      'hold-or-spend': 'keep-back',
      'biggest-card': 'gear',
      'card-order': 'enjoy-order-leaning',
      'behind-early': 'relaxed',
      'protector-or-striker': 'protector',
      'token-or-face-down': 'face-down-leaning',
      'best-days': 'disagree',
      'shrink-or-buff': 'shrink',
      'shutting-down': 'strongly-agree',
      'quick-games': 'strongly-disagree',
      'move-or-attack': 'move-it',
      'formation-or-tricks': 'formation-leaning',
      'one-clear-job': 'disagree',
      'edge-hand-or-board': 'hand',
      'finisher-or-spread': 'finisher-leaning',
    },
  },
  {
    name: 'puzzle-loving combo player',
    archetype: 'Combo',
    answers: {
      'first-turn': 'ramp-leaning',
      'damage-or-stun': 'damage-leaning',
      'units-or-answers': 'units-leaning',
      'tokens-or-trash': 'trash-leaning',
      'cut-one-card': 'cut-steady',
      'draw-or-ramp': 'draw',
      'reading-their-hand': 'work-it-out',
      'which-win': 'turn-nine-leaning',
      'hold-or-press': 'press-leaning',
      'discard-or-sacrifice': 'discard-leaning',
      'all-in-or-measured': 'all-in',
      'hold-or-spend': 'keep-back-leaning',
      'biggest-card': 'gear',
      'card-order': 'enjoy-order',
      'behind-early': 'relaxed',
      'protector-or-striker': 'striker-leaning',
      'token-or-face-down': 'face-down-leaning',
      'best-days': 'strongly-agree',
      'shrink-or-buff': 'shrink',
      'shutting-down': 'disagree',
      'quick-games': 'disagree',
      'move-or-attack': 'move-it-leaning',
      'formation-or-tricks': 'bag-of-tricks-leaning',
      'one-clear-job': 'strongly-disagree',
      'edge-hand-or-board': 'hand',
      'finisher-or-spread': 'finisher',
    },
  },
  {
    name: 'Fury and Chaos brawler (Domain lean)',
    archetype: 'Aggro',
    dominantDomainAxes: ['fury-calm', 'chaos-order'],
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage',
      'units-or-answers': 'units',
      'tokens-or-trash': 'trash',
      'cut-one-card': 'cut-steady',
      'draw-or-ramp': 'rune-leaning',
      'reading-their-hand': 'play-your-game',
      'which-win': 'turn-four',
      'hold-or-press': 'press',
      'discard-or-sacrifice': 'discard',
      'all-in-or-measured': 'all-in',
      'hold-or-spend': 'spend',
      'biggest-card': 'huge-unit-leaning',
      'card-order': 'barely-matters',
      'behind-early': 'itchy',
      'protector-or-striker': 'striker',
      'token-or-face-down': 'face-down',
      'best-days': 'strongly-agree',
      'shrink-or-buff': 'buff-leaning',
      'shutting-down': 'strongly-disagree',
      'quick-games': 'agree',
      'move-or-attack': 'attack',
      'formation-or-tricks': 'bag-of-tricks',
      'one-clear-job': 'agree',
      'edge-hand-or-board': 'board-leaning',
      'finisher-or-spread': 'finisher-leaning',
    },
  },
  {
    name: 'Calm and Order tactician (Domain lean)',
    archetype: 'Control',
    dominantDomainAxes: ['fury-calm', 'chaos-order'],
    answers: {
      'first-turn': 'ramp',
      'damage-or-stun': 'stun',
      'units-or-answers': 'answers',
      'tokens-or-trash': 'tokens',
      'cut-one-card': 'cut-bomb',
      'draw-or-ramp': 'draw-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'which-win': 'turn-nine',
      'hold-or-press': 'hold',
      'discard-or-sacrifice': 'sacrifice',
      'all-in-or-measured': 'measured',
      'hold-or-spend': 'keep-back',
      'biggest-card': 'gear-leaning',
      'card-order': 'enjoy-order-leaning',
      'behind-early': 'relaxed-leaning',
      'protector-or-striker': 'protector',
      'token-or-face-down': 'tokens-on-death',
      'best-days': 'strongly-disagree',
      'shrink-or-buff': 'shrink-leaning',
      'shutting-down': 'agree',
      'quick-games': 'disagree',
      'move-or-attack': 'move-it',
      'formation-or-tricks': 'formation',
      'one-clear-job': 'agree',
      'edge-hand-or-board': 'hand-leaning',
      'finisher-or-spread': 'spread',
    },
  },
]

describe('Personas land on their expected Archetype', () => {
  for (const persona of PERSONAS) {
    it(persona.name, () => {
      const profile = computeProfile(QUESTION_SET, persona.answers)
      const matches = rankLegends(profile, pool)
      expect(deriveArchetype(matches), `profile ${JSON.stringify(profile)}, top: ${matches.slice(0, 3).map((m) => `${m.legend.name} (${m.build.archetype}) ${m.fit}`).join(', ')}`).toBe(
        persona.archetype,
      )
      if (persona.dominantDomainAxes) {
        expect([...domainLean(profile, pool).axes].sort()).toEqual([...persona.dominantDomainAxes].sort())
      }
    })
  }

  it('every Persona gives a real Answer to every Question', () => {
    for (const persona of PERSONAS) {
      expect(Object.keys(persona.answers).sort()).toEqual(QUESTION_SET.questions.map((q) => q.id).sort())
      for (const question of QUESTION_SET.questions) {
        expect(answersOf(question).map((a) => a.id), `${persona.name} / ${question.id}`).toContain(persona.answers[question.id])
      }
    }
  })
})
