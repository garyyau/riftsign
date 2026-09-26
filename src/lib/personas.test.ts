/**
 * Persona fixtures (spec 0001, quality gates). Eight fixed Answer sets against the committed
 * Questions and Legends. If a Question or rating edit moves a Persona to the wrong Archetype,
 * this fails the build. Personas are never shown to Players.
 *
 * Each set answers the Questions as that kind of player honestly would, taking the middle or
 * "none of these" answer wherever they would, rather than the answer that scores best.
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
  /**
   * A known miss caused by Legend ratings rather than the Questions (those are evaluated
   * separately). The test is expected to fail, and starts passing once the ratings are fixed.
   */
  knownLegendIssue?: string
}

const PERSONAS: Persona[] = [
  {
    name: 'impatient aggro player',
    archetype: 'Aggro',
    answers: {
      'say-out-loud': 'everyone-attacks',
      'perfect-win': 'over-early',
      'reading-new-card': 'does-what-it-says',
      'game-night-story': 'charged-battlefield',
      'hand-good-day': 'units-to-play',
      'coin-flip-card': 'try-then-cut',
      'build-around': 'one-giant-unit',
      'opening-play': 'cheapest-unit',
      'favourite-turn': 'ten-seconds',
      'friend-says': 'nothing-like-these',
      'their-turn': 'make-them-sweat',
      'hoping-for': 'normal-hand',
      'brag-about': 'attacked-every-turn',
      'behind-early-mood': 'itchy',
      'card-sequence': 'obvious-first',
      'makes-you-grin': 'lands-harder',
      'scary-play': 'race-it',
      'loss-stings-least': 'either-way',
      'their-complaint': 'very-polite',
      'most-frustrating': 'six-things-at-once',
      'ideal-game-night': 'lots-of-quick',
    },
  },
  {
    name: 'tricky tempo player',
    archetype: 'Tempo',
    answers: {
      'say-out-loud': 'quiet-player',
      'perfect-win': 'quick-earned',
      'reading-new-card': 'neat-trick',
      'game-night-story': 'stopped-cold',
      'hand-good-day': 'one-kept-back',
      'coin-flip-card': 'one-or-two',
      'build-around': 'keep-coming-back',
      'opening-play': 'push-when-safe',
      'favourite-turn': 'two-work-nicely',
      'friend-says': 'never-know',
      'their-turn': 'make-them-sweat',
      'hoping-for': 'bit-of-luck',
      'brag-about': 'dont-brag',
      'behind-early-mood': 'little-itchy',
      'card-sequence': 'think-then-go',
      'makes-you-grin': 'face-down-flip',
      'scary-play': 'stick-to-plan',
      'loss-stings-least': 'either-way',
      'their-complaint': 'where-from',
      'most-frustrating': 'nothing-to-think',
      'ideal-game-night': 'mostly-quick',
    },
  },
  {
    name: 'steady midrange player',
    archetype: 'Midrange',
    answers: {
      'say-out-loud': 'mines-bigger',
      'perfect-win': 'tips-late',
      'reading-new-card': 'does-what-it-says',
      'game-night-story': 'no-stories',
      'hand-good-day': 'one-kept-back',
      'coin-flip-card': 'try-then-cut',
      'build-around': 'one-giant-unit',
      'opening-play': 'push-when-safe',
      'favourite-turn': 'one-good-card',
      'friend-says': 'nothing-like-these',
      'their-turn': 'own-board',
      'hoping-for': 'normal-hand',
      'brag-about': 'twice-the-size',
      'behind-early-mood': 'one-more-turn',
      'card-sequence': 'think-then-go',
      'makes-you-grin': 'grin-elsewhere',
      'scary-play': 'stick-to-plan',
      'loss-stings-least': 'played-it-safe',
      'their-complaint': 'very-polite',
      'most-frustrating': 'remember-their-cards',
      'ideal-game-night': 'none-rushed',
    },
  },
  {
    name: 'patient control player',
    archetype: 'Control',
    answers: {
      'say-out-loud': 'draw-a-few-more',
      'perfect-win': 'long-and-full',
      'reading-new-card': 'three-uses',
      'game-night-story': 'stopped-cold',
      'hand-good-day': 'answers-first',
      'coin-flip-card': 'pass',
      'build-around': 'copy-a-friend',
      'opening-play': 'pays-off-later',
      'favourite-turn': 'two-work-nicely',
      'friend-says': 'regret-attacking',
      'their-turn': 'watching-every-move',
      'hoping-for': 'no-luck',
      'brag-about': 'dont-brag',
      'behind-early-mood': 'let-them',
      'card-sequence': 'perfect-sequence',
      'makes-you-grin': 'shrinking-unit',
      'scary-play': 'nothing-else-matters',
      'loss-stings-least': 'played-it-safe',
      'their-complaint': 'never-got-through',
      'most-frustrating': 'nothing-to-think',
      'ideal-game-night': 'two-or-three-long',
    },
  },
  {
    name: 'puzzle-loving combo player',
    archetype: 'Combo',
    knownLegendIssue:
      'Every Combo Build is rated variance 6 or higher, so a combo player who hates luck lands on Control (docs/research/2026-09-24-quiz-v3-evaluation.md).',
    answers: {
      'say-out-loud': 'draw-a-few-more',
      'perfect-win': 'tips-late',
      'reading-new-card': 'three-uses',
      'game-night-story': 'extra-cards',
      'hand-good-day': 'one-kept-back',
      'coin-flip-card': 'pass',
      'build-around': 'keep-coming-back',
      'opening-play': 'pays-off-later',
      'favourite-turn': 'setup-clicks',
      'friend-says': 'never-runs-out',
      'their-turn': 'own-board',
      'hoping-for': 'normal-hand',
      'brag-about': 'dont-brag',
      'behind-early-mood': 'let-them',
      'card-sequence': 'perfect-sequence',
      'makes-you-grin': 'grin-elsewhere',
      'scary-play': 'stick-to-plan',
      'loss-stings-least': 'played-it-safe',
      'their-complaint': 'very-polite',
      'most-frustrating': 'same-every-turn',
      'ideal-game-night': 'none-rushed',
    },
  },
  {
    name: 'Fury and Chaos brawler (leading Domains)',
    archetype: 'Aggro',
    leadingDomains: ['Fury', 'Chaos'],
    answers: {
      'say-out-loud': 'everyone-attacks',
      'perfect-win': 'over-early',
      'reading-new-card': 'neat-trick',
      'game-night-story': 'charged-battlefield',
      'hand-good-day': 'units-to-play',
      'coin-flip-card': 'as-many-as-allowed',
      'build-around': 'keep-coming-back',
      'opening-play': 'cheapest-unit',
      'favourite-turn': 'one-good-card',
      'friend-says': 'never-know',
      'their-turn': 'make-them-sweat',
      'hoping-for': 'wild-opening',
      'brag-about': 'attacked-every-turn',
      'behind-early-mood': 'itchy',
      'card-sequence': 'obvious-first',
      'makes-you-grin': 'lands-harder',
      'scary-play': 'race-it',
      'loss-stings-least': 'went-all-in',
      'their-complaint': 'where-from',
      'most-frustrating': 'six-things-at-once',
      'ideal-game-night': 'lots-of-quick',
    },
  },
  {
    name: 'Calm and Order tactician (leading Domains)',
    archetype: 'Control',
    leadingDomains: ['Calm', 'Order'],
    answers: {
      'say-out-loud': 'quiet-player',
      'perfect-win': 'long-and-full',
      'reading-new-card': 'neat-trick',
      'game-night-story': 'stopped-cold',
      'hand-good-day': 'ways-to-answer',
      'coin-flip-card': 'pass',
      'build-around': 'crowd-of-small',
      'opening-play': 'plan-behind-it',
      'favourite-turn': 'two-work-nicely',
      'friend-says': 'regret-attacking',
      'their-turn': 'watching-every-move',
      'hoping-for': 'no-luck',
      'brag-about': 'two-more-behind',
      'behind-early-mood': 'let-them',
      'card-sequence': 'think-then-go',
      'makes-you-grin': 'grin-elsewhere',
      'scary-play': 'needs-answering',
      'loss-stings-least': 'played-it-safe',
      'their-complaint': 'never-got-through',
      'most-frustrating': 'nothing-to-think',
      'ideal-game-night': 'none-rushed',
    },
  },
  {
    // Loves both halves of an old opposite pair, which the bipolar Domain Axes could not express.
    name: 'Fury and Calm duellist (both halves of an old pair)',
    archetype: 'Midrange',
    leadingDomains: ['Fury', 'Calm'],
    answers: {
      'say-out-loud': 'everyone-attacks',
      'perfect-win': 'tips-late',
      'reading-new-card': 'does-what-it-says',
      'game-night-story': 'charged-battlefield',
      'hand-good-day': 'one-kept-back',
      'coin-flip-card': 'try-then-cut',
      'build-around': 'copy-a-friend',
      'opening-play': 'push-when-safe',
      'favourite-turn': 'one-good-card',
      'friend-says': 'regret-attacking',
      'their-turn': 'mostly-watching',
      'hoping-for': 'normal-hand',
      'brag-about': 'attacked-every-turn',
      'behind-early-mood': 'one-more-turn',
      'card-sequence': 'think-then-go',
      'makes-you-grin': 'lands-harder',
      'scary-play': 'needs-answering',
      'loss-stings-least': 'either-way',
      'their-complaint': 'never-got-through',
      'most-frustrating': 'six-things-at-once',
      'ideal-game-night': 'mostly-quick',
    },
  },
]

describe('Personas land on their expected Archetype', () => {
  for (const persona of PERSONAS) {
    ;(persona.knownLegendIssue ? it.fails : it)(persona.name, () => {
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
