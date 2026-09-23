/**
 * Persona fixtures (spec 0001, quality gates). Seven fixed Answer sets against the committed
 * Questions and Legends. If a Question or rating edit moves a Persona to the wrong Archetype,
 * this fails the build. Personas are never shown to Players.
 */
import { describe, expect, it } from 'vitest'
import { ALL_LEGENDS, QUESTION_SET } from '@/data'
import type { AxisId } from './axes'
import { computeProfile, deriveArchetype, domainLean, rankLegends } from './scoring'
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
      'opening-hand': 'pressure',
      'long-games': 'strongly-disagree',
      stabilising: 'all-in',
      'which-win': 'turn-four',
      'scary-play': 'ignore',
      'hand-full-of': 'threats',
      'shutting-down': 'disagree',
      racing: 'set-pace',
      'reading-cards': 'one-thing',
      'punishing-deck': 'exhausting',
      straightforward: 'strongly-agree',
      'favourite-turn': 'biggest',
      'coin-flip-card': 'love-it',
      consistency: 'neutral',
      'game-night-story': 'top-deck',
      'behind-on-board': 'dig',
      'table-mood': 'relentless',
      'fired-up': 'strongly-agree',
      'battle-cry': 'burn',
      'win-because': 'bigger',
      'spells-over-creatures': 'disagree',
      'ideal-crew': 'warriors',
      'game-plan': 'chaos',
      'break-the-rules': 'agree',
      'rules-are': 'bendable',
    },
  },
  {
    name: 'tricky tempo player',
    archetype: 'Tempo',
    answers: {
      'opening-hand': 'pressure',
      'long-games': 'disagree',
      stabilising: 'one-swing',
      'which-win': 'turn-four',
      'scary-play': 'ignore',
      'hand-full-of': 'threats',
      'shutting-down': 'neutral',
      racing: 'punish',
      'reading-cards': 'three-ways',
      'punishing-deck': 'perfect',
      straightforward: 'disagree',
      'favourite-turn': 'chain',
      'coin-flip-card': 'no-thanks',
      consistency: 'neutral',
      'game-night-story': 'top-deck',
      'behind-on-board': 'claw-back',
      'table-mood': 'relentless',
      'fired-up': 'agree',
      'battle-cry': 'burn',
      'win-because': 'outsmart',
      'spells-over-creatures': 'agree',
      'ideal-crew': 'scholars',
      'game-plan': 'chaos',
      'break-the-rules': 'neutral',
      'rules-are': 'bendable',
    },
  },
  {
    name: 'steady midrange player',
    archetype: 'Midrange',
    answers: {
      'opening-hand': 'pressure',
      'long-games': 'neutral',
      stabilising: 'grind',
      'which-win': 'turn-nine',
      'scary-play': 'ignore',
      'hand-full-of': 'threats',
      'shutting-down': 'neutral',
      racing: 'punish',
      'reading-cards': 'one-thing',
      'punishing-deck': 'sometimes',
      straightforward: 'agree',
      'favourite-turn': 'biggest',
      'coin-flip-card': 'no-thanks',
      consistency: 'strongly-agree',
      'game-night-story': 'controlled',
      'behind-on-board': 'claw-back',
      'table-mood': 'composed',
      'fired-up': 'neutral',
      'battle-cry': 'burn',
      'win-because': 'bigger',
      'spells-over-creatures': 'strongly-disagree',
      'ideal-crew': 'warriors',
      'game-plan': 'structured',
      'break-the-rules': 'disagree',
      'rules-are': 'framework',
    },
  },
  {
    name: 'patient control player',
    archetype: 'Control',
    answers: {
      'opening-hand': 'flexible',
      'long-games': 'strongly-agree',
      stabilising: 'grind',
      'which-win': 'turn-nine',
      'scary-play': 'answer',
      'hand-full-of': 'answers',
      'shutting-down': 'strongly-agree',
      racing: 'punish',
      'reading-cards': 'three-ways',
      'punishing-deck': 'perfect',
      straightforward: 'disagree',
      'favourite-turn': 'chain',
      'coin-flip-card': 'no-thanks',
      consistency: 'strongly-agree',
      'game-night-story': 'controlled',
      'behind-on-board': 'claw-back',
      'table-mood': 'composed',
      'fired-up': 'strongly-disagree',
      'battle-cry': 'breathe',
      'win-because': 'outsmart',
      'spells-over-creatures': 'agree',
      'ideal-crew': 'scholars',
      'game-plan': 'structured',
      'break-the-rules': 'disagree',
      'rules-are': 'framework',
    },
  },
  {
    name: 'puzzle-loving combo player',
    archetype: 'Combo',
    answers: {
      'opening-hand': 'setup',
      'long-games': 'agree',
      stabilising: 'one-swing',
      'which-win': 'turn-nine',
      'scary-play': 'ignore',
      'hand-full-of': 'threats',
      'shutting-down': 'disagree',
      racing: 'punish',
      'reading-cards': 'three-ways',
      'punishing-deck': 'perfect',
      straightforward: 'strongly-disagree',
      'favourite-turn': 'chain',
      'coin-flip-card': 'love-it',
      consistency: 'strongly-disagree',
      'game-night-story': 'top-deck',
      'behind-on-board': 'dig',
      'table-mood': 'composed',
      'fired-up': 'neutral',
      'battle-cry': 'burn',
      'win-because': 'outsmart',
      'spells-over-creatures': 'strongly-agree',
      'ideal-crew': 'scholars',
      'game-plan': 'chaos',
      'break-the-rules': 'neutral',
      'rules-are': 'framework',
    },
  },
  {
    name: 'Fury and Chaos brawler (Domain lean)',
    archetype: 'Aggro',
    dominantDomainAxes: ['fury-calm', 'chaos-order'],
    answers: {
      'opening-hand': 'pressure',
      'long-games': 'disagree',
      stabilising: 'all-in',
      'which-win': 'turn-four',
      'scary-play': 'ignore',
      'hand-full-of': 'threats',
      'shutting-down': 'disagree',
      racing: 'set-pace',
      'reading-cards': 'one-thing',
      'punishing-deck': 'sometimes',
      straightforward: 'agree',
      'favourite-turn': 'biggest',
      'coin-flip-card': 'love-it',
      consistency: 'disagree',
      'game-night-story': 'top-deck',
      'behind-on-board': 'dig',
      'table-mood': 'relentless',
      'fired-up': 'strongly-agree',
      'battle-cry': 'burn',
      'win-because': 'outsmart',
      'spells-over-creatures': 'neutral',
      'ideal-crew': 'warriors',
      'game-plan': 'chaos',
      'break-the-rules': 'strongly-agree',
      'rules-are': 'bendable',
    },
  },
  {
    name: 'Calm and Order tactician (Domain lean)',
    archetype: 'Control',
    dominantDomainAxes: ['fury-calm', 'chaos-order'],
    answers: {
      'opening-hand': 'flexible',
      'long-games': 'agree',
      stabilising: 'grind',
      'which-win': 'turn-nine',
      'scary-play': 'answer',
      'hand-full-of': 'answers',
      'shutting-down': 'agree',
      racing: 'punish',
      'reading-cards': 'one-thing',
      'punishing-deck': 'sometimes',
      straightforward: 'agree',
      'favourite-turn': 'biggest',
      'coin-flip-card': 'no-thanks',
      consistency: 'strongly-agree',
      'game-night-story': 'controlled',
      'behind-on-board': 'claw-back',
      'table-mood': 'composed',
      'fired-up': 'strongly-disagree',
      'battle-cry': 'breathe',
      'win-because': 'bigger',
      'spells-over-creatures': 'neutral',
      'ideal-crew': 'scholars',
      'game-plan': 'structured',
      'break-the-rules': 'strongly-disagree',
      'rules-are': 'framework',
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

  it('every Persona answers every Question', () => {
    for (const persona of PERSONAS) {
      expect(Object.keys(persona.answers).sort()).toEqual(QUESTION_SET.questions.map((q) => q.id).sort())
    }
  })
})
