/**
 * Persona fixtures (spec 0001, quality gates). Eight fixed Answer sets against the committed
 * Questions and Legends. If a Question or rating edit moves a Persona to the wrong Archetype,
 * this fails the build. Personas are never shown to Players.
 *
 * Each set answers the Questions as that kind of player honestly would, using a scale's
 * "-leaning" point wherever they would be lukewarm rather than picking the pole that scores best.
 * Playstyle Personas answer Domain Questions by what suits how they play; Domain Personas answer
 * them for the Domains they love.
 */
import { describe, expect, it } from 'vitest'
import { ALL_LEGENDS, QUESTION_SET } from '@/data'
import type { Domain } from './axes'
import { answersOf, computeProfile, deriveArchetype, leadingDomains, rankLegends } from './scoring'
import type { Answers, Archetype } from './types'

// The seed pool is unreviewed until Ingestion approves it; the fixtures still need to rank against it.
const pool = ALL_LEGENDS.map((l) => ({ ...l, builds: l.builds.map((b) => ({ ...b, reviewed: true })) }))

interface Persona {
  name: string
  answers: Answers
  archetype: Archetype
  /** The Domains "Your Domains" should highlight for this Persona. */
  leadingDomains?: Domain[]
}

const PERSONAS: Persona[] = [
  {
    name: 'impatient aggro player',
    archetype: 'Aggro',
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage',
      'units-or-answers': 'units',
      'shrink-or-buff': 'buff',
      'cut-one-card': 'cut-steady-leaning',
      'discard-or-sacrifice': 'discard-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'ready-or-look': 'ready',
      'which-win': 'turn-four',
      'hold-or-deathknell': 'soldiers-on-death-leaning',
      'all-in-or-measured': 'all-in',
      'rune-or-assault': 'assault',
      'hold-or-spend': 'spend',
      'dig-or-huge': 'dig-leaning',
      'card-order': 'barely-matters-leaning',
      'tank-or-hidden': 'hidden-leaning',
      'behind-early': 'itchy',
      'gear-or-trash': 'from-trash-leaning',
      'best-days': 'agree',
      'grower-or-soldiers': 'soldiers-leaning',
      'shutting-down': 'disagree',
      'kill-or-conquer': 'conquer',
      'strongest-or-setup': 'strongest-card',
      'move-or-shrink': 'shrink-in-fights-leaning',
      'quick-games': 'strongly-agree',
      'one-clear-job': 'agree',
      'swingy-or-spread': 'spread-leaning',
    },
  },
  {
    name: 'tricky tempo player',
    archetype: 'Tempo',
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage-leaning',
      'units-or-answers': 'units-leaning',
      'shrink-or-buff': 'shrink-leaning',
      'cut-one-card': 'cut-bomb-leaning',
      'discard-or-sacrifice': 'discard-leaning',
      'reading-their-hand': 'work-it-out-leaning',
      'ready-or-look': 'ready-leaning',
      'which-win': 'turn-four-leaning',
      'hold-or-deathknell': 'draw-on-hold-leaning',
      'all-in-or-measured': 'measured-leaning',
      'rune-or-assault': 'assault-leaning',
      'hold-or-spend': 'spend-leaning',
      'dig-or-huge': 'dig-leaning',
      'card-order': 'enjoy-order',
      'tank-or-hidden': 'hidden',
      'behind-early': 'itchy-leaning',
      'gear-or-trash': 'gear-leaning',
      'best-days': 'neutral',
      'grower-or-soldiers': 'soldiers-leaning',
      'shutting-down': 'disagree',
      'kill-or-conquer': 'kill-leaning',
      'strongest-or-setup': 'setup-pays-off-leaning',
      'move-or-shrink': 'move-away',
      'quick-games': 'agree',
      'one-clear-job': 'disagree',
      'swingy-or-spread': 'spread-leaning',
    },
  },
  {
    name: 'steady midrange player',
    archetype: 'Midrange',
    answers: {
      'first-turn': 'ramp-leaning',
      'damage-or-stun': 'stun-leaning',
      'units-or-answers': 'units-leaning',
      'shrink-or-buff': 'buff-leaning',
      'cut-one-card': 'cut-bomb',
      'discard-or-sacrifice': 'sacrifice-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'ready-or-look': 'look-leaning',
      'which-win': 'turn-nine-leaning',
      'hold-or-deathknell': 'draw-on-hold-leaning',
      'all-in-or-measured': 'measured',
      'rune-or-assault': 'rune-leaning',
      'hold-or-spend': 'spend-leaning',
      'dig-or-huge': 'huge-unit',
      'card-order': 'barely-matters-leaning',
      'tank-or-hidden': 'tank-leaning',
      'behind-early': 'relaxed-leaning',
      'gear-or-trash': 'gear-leaning',
      'best-days': 'disagree',
      'grower-or-soldiers': 'grower-leaning',
      'shutting-down': 'neutral',
      'kill-or-conquer': 'kill-leaning',
      'strongest-or-setup': 'strongest-card-leaning',
      'move-or-shrink': 'shrink-in-fights-leaning',
      'quick-games': 'disagree',
      'one-clear-job': 'agree',
      'swingy-or-spread': 'spread',
    },
  },
  {
    name: 'patient control player',
    archetype: 'Control',
    answers: {
      'first-turn': 'ramp',
      'damage-or-stun': 'stun',
      'units-or-answers': 'answers',
      'shrink-or-buff': 'shrink',
      'cut-one-card': 'cut-bomb-leaning',
      'discard-or-sacrifice': 'sacrifice-leaning',
      'reading-their-hand': 'work-it-out-leaning',
      'ready-or-look': 'look',
      'which-win': 'turn-nine',
      'hold-or-deathknell': 'draw-on-hold',
      'all-in-or-measured': 'measured',
      'rune-or-assault': 'rune',
      'hold-or-spend': 'keep-back',
      'dig-or-huge': 'huge-unit-leaning',
      'card-order': 'enjoy-order-leaning',
      'tank-or-hidden': 'tank-leaning',
      'behind-early': 'relaxed',
      'gear-or-trash': 'gear',
      'best-days': 'disagree',
      'grower-or-soldiers': 'grower-leaning',
      'shutting-down': 'strongly-agree',
      'kill-or-conquer': 'kill',
      'strongest-or-setup': 'setup-pays-off-leaning',
      'move-or-shrink': 'move-away-leaning',
      'quick-games': 'strongly-disagree',
      'one-clear-job': 'disagree',
      'swingy-or-spread': 'spread-leaning',
    },
  },
  {
    name: 'puzzle-loving combo player',
    archetype: 'Combo',
    answers: {
      'first-turn': 'ramp-leaning',
      'damage-or-stun': 'damage-leaning',
      'units-or-answers': 'units-leaning',
      'shrink-or-buff': 'shrink',
      'cut-one-card': 'cut-steady',
      'discard-or-sacrifice': 'discard-leaning',
      'reading-their-hand': 'work-it-out',
      'ready-or-look': 'look',
      'which-win': 'turn-nine-leaning',
      'hold-or-deathknell': 'draw-on-hold-leaning',
      'all-in-or-measured': 'all-in',
      'rune-or-assault': 'rune-leaning',
      'hold-or-spend': 'keep-back-leaning',
      'dig-or-huge': 'dig',
      'card-order': 'enjoy-order',
      'tank-or-hidden': 'hidden-leaning',
      'behind-early': 'relaxed',
      'gear-or-trash': 'from-trash',
      'best-days': 'strongly-agree',
      'grower-or-soldiers': 'soldiers-leaning',
      'shutting-down': 'disagree',
      'kill-or-conquer': 'kill-leaning',
      'strongest-or-setup': 'setup-pays-off',
      'move-or-shrink': 'shrink-in-fights-leaning',
      'quick-games': 'disagree',
      'one-clear-job': 'strongly-disagree',
      'swingy-or-spread': 'swingy-leaning',
    },
  },
  {
    name: 'Fury and Chaos brawler (leading Domains)',
    archetype: 'Aggro',
    leadingDomains: ['Fury', 'Chaos'],
    answers: {
      'first-turn': 'pressure',
      'damage-or-stun': 'damage',
      'units-or-answers': 'units',
      'shrink-or-buff': 'buff-leaning',
      'cut-one-card': 'cut-steady',
      'discard-or-sacrifice': 'discard',
      'reading-their-hand': 'play-your-game',
      'ready-or-look': 'ready',
      'which-win': 'turn-four',
      'hold-or-deathknell': 'soldiers-on-death-leaning',
      'all-in-or-measured': 'all-in',
      'rune-or-assault': 'assault',
      'hold-or-spend': 'spend',
      'dig-or-huge': 'dig',
      'card-order': 'barely-matters',
      'tank-or-hidden': 'hidden',
      'behind-early': 'itchy',
      'gear-or-trash': 'from-trash',
      'best-days': 'strongly-agree',
      'grower-or-soldiers': 'grower-leaning',
      'shutting-down': 'strongly-disagree',
      'kill-or-conquer': 'conquer',
      'strongest-or-setup': 'strongest-card',
      'move-or-shrink': 'shrink-in-fights-leaning',
      'quick-games': 'agree',
      'one-clear-job': 'agree',
      'swingy-or-spread': 'swingy-leaning',
    },
  },
  {
    name: 'Calm and Order tactician (leading Domains)',
    archetype: 'Control',
    leadingDomains: ['Calm', 'Order'],
    answers: {
      'first-turn': 'ramp',
      'damage-or-stun': 'stun',
      'units-or-answers': 'answers',
      'shrink-or-buff': 'shrink-leaning',
      'cut-one-card': 'cut-bomb',
      'discard-or-sacrifice': 'sacrifice',
      'reading-their-hand': 'play-your-game-leaning',
      'ready-or-look': 'look-leaning',
      'which-win': 'turn-nine',
      // Both are loved Domains, so it's only a lean either way.
      'hold-or-deathknell': 'draw-on-hold-leaning',
      'all-in-or-measured': 'measured',
      'rune-or-assault': 'rune-leaning',
      'hold-or-spend': 'keep-back',
      'dig-or-huge': 'huge-unit-leaning',
      'card-order': 'enjoy-order-leaning',
      'tank-or-hidden': 'tank',
      'behind-early': 'relaxed-leaning',
      'gear-or-trash': 'gear-leaning',
      'best-days': 'strongly-disagree',
      'grower-or-soldiers': 'soldiers',
      'shutting-down': 'agree',
      'kill-or-conquer': 'kill',
      'strongest-or-setup': 'strongest-card-leaning',
      'move-or-shrink': 'move-away',
      'quick-games': 'disagree',
      'one-clear-job': 'agree',
      'swingy-or-spread': 'spread',
    },
  },
  {
    // Loves both halves of an old opposite pair, which the bipolar Domain Axes could not express.
    name: 'Fury and Calm duellist (both halves of an old pair)',
    archetype: 'Midrange',
    leadingDomains: ['Fury', 'Calm'],
    answers: {
      'first-turn': 'ramp-leaning',
      'damage-or-stun': 'damage-leaning',
      'units-or-answers': 'units-leaning',
      'shrink-or-buff': 'buff-leaning',
      'cut-one-card': 'cut-bomb',
      'discard-or-sacrifice': 'sacrifice-leaning',
      'reading-their-hand': 'play-your-game-leaning',
      'ready-or-look': 'ready',
      'which-win': 'turn-nine-leaning',
      'hold-or-deathknell': 'draw-on-hold',
      'all-in-or-measured': 'measured',
      'rune-or-assault': 'assault',
      'hold-or-spend': 'spend-leaning',
      'dig-or-huge': 'huge-unit',
      'card-order': 'barely-matters-leaning',
      'tank-or-hidden': 'tank',
      'behind-early': 'relaxed-leaning',
      'gear-or-trash': 'gear-leaning',
      'best-days': 'disagree',
      'grower-or-soldiers': 'grower-leaning',
      'shutting-down': 'neutral',
      'kill-or-conquer': 'conquer',
      'strongest-or-setup': 'strongest-card-leaning',
      'move-or-shrink': 'move-away',
      'quick-games': 'disagree',
      'one-clear-job': 'agree',
      'swingy-or-spread': 'spread',
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
      if (persona.leadingDomains) {
        expect([...leadingDomains(profile)].sort(), `profile ${JSON.stringify(profile)}`).toEqual([...persona.leadingDomains].sort())
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
