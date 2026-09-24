# Riftsign v4 question set: rationale

21 scenarios, version `2026-12`. Seven multi-Domain questions with three Domain answers and a "none" answer, and fourteen single-Axis playstyle questions with three or four graded answers. Interleaved D, P, P so no two neighbours load the same score. Validated with `corepack pnpm simulate` on 2026-09-24.

## One schema note the coordinator should see

`answerSchema` in `src/lib/schemas.ts` requires `moves.min(1)`, so the brief's `moves: []` for the "none" answers fails validation (seven "Too small" issues, one per Domain question). Each "none" answer therefore carries a single placeholder move, `{ axis: <that question's first Domain>, weight: 0 }`. A zero weight moves nothing and does not change any reach calculation. Once the engine update relaxes `min(1)`, delete those seven placeholders. I did not touch the repo.

## Per-question notes

Format: framing, what it measures, biggest risk.

1. `say-out-loud`. A line you'd say out loud. Domains calm / fury / body. Risk: "Mine's bigger" is the funniest line and may get picked for the joke rather than the Domain.
2. `perfect-win`. What a perfect win looks like. Pace, fast first. Risk: "every card I saved" could read as complexity to a player who hears "plan" rather than "long game".
3. `reading-new-card`. How you react to a new card's text. Complexity, intricate first. Risk: "three uses and I'll find every one" flatters the reader slightly more than the other three.
4. `game-night-story`. The story you tell after game night. Domains fury / calm / mind. Risk: the Fury story is the only one that ends in points scored; the Calm and Mind stories are moments of advantage, not wins.
5. `hand-good-day`. What your hand looks like on a good day. Stance, proactive first. Risk: "answers for whatever they try" may sound smarter than "units I can't wait to put down".
6. `coin-flip-card`. How you feel about a gamble card. Variance, swingy first. Risk: the 50/50 framing is a little abstract next to the rest of the set; the middle steps are close to each other.
7. `build-around`. What you'd build a deck around. Domains body / chaos / order. Risk: "cards that keep coming back" describes a mechanic rather than a moment, which is a shade less pictureable than the other two.
8. `opening-play`. What goes down on the first turn (timing is the point, so the turn stays). Pace, fast first. Risk: "early points aren't my thing" could sound careless to a beginner rather than patient.
9. `favourite-turn`. Your favourite kind of turn. Complexity, simple first (reverse-keyed). Risk: "one I can play in ten seconds" could be read as lazy rather than a taste for simplicity.
10. `friend-says`. What a friend would say about how you play. Domains mind / calm / chaos. Risk: the Calm line ("lets you attack, then makes you regret it") also reads as reactive stance, so it may double-count for reactive players.
11. `their-turn`. What you're doing on their turn. Stance, reactive first (reverse-keyed). Risk: "their turn is my break" is a joke and may be picked for tone; the two middle steps differ by one word each.
12. `all-in-attack`. The attack decision when you have the numbers. Variance, swingy first. Risk: "send just enough, and keep the rest back" is closest to textbook play and may draw the "sensible" vote.
13. `brag-about`. What you'd brag about. Domains order / fury / body. Risk: "I attacked every single turn" is a plan as much as a Domain, so fast-pace players may pick it regardless of Domain taste.
14. `behind-early-mood`. Your mood when they score first. Pace, slow first (reverse-keyed). Risk: "Fine. Let them." can read as the composed, experienced answer.
15. `card-sequence`. How you react when the order of your cards matters. Complexity, intricate first. Risk: "find the perfect sequence" still carries a whiff of the skilled answer.
16. `makes-you-grin`. Which moment makes you grin. Domains chaos / fury / mind. Risk: "face-down card" is a real mechanic a two-week player may not have met, though the words themselves are plain.
17. `scary-play`. Your first thought when they play something scary. Stance, proactive first. Risk: "Nothing else matters until that's gone" is more emphatic than the proactive pole, which may pull the scale toward reactive.
18. `loss-stings-least`. Which loss stings least. Variance, steady first (reverse-keyed), three answers with a 0 middle. Risk: an unusual angle; some players may read it as "which loss is most honourable" and pick the safe one for that reason.
19. `their-complaint`. What your opponent grumbles about after losing. Domains chaos / order / calm. Risk: the "none" answer ("We're very polite") is the funniest line in the question.
20. `most-frustrating`. What frustrates you most. Complexity, intricate first. Risk: the two low-complexity answers are both about tracking, so the −1 and −2 steps may feel closer than the +1 and +2 steps.
21. `ideal-game-night`. Your ideal game night. Pace, fast first. Risk: a player's game-night preference is partly about their friends and their schedule, not just how fast they want a game decided.

## Framing types used (all distinct)

Line out loud, perfect win, reading a new card, story after game night, your hand on a good day, feeling about a gamble card, build a deck around, first-turn play, favourite turn, friend describing you, what you do on their turn, the attack decision, brag, mood when behind, reaction when order matters, moment that makes you grin, first thought at a scary play, loss that stings least, opponent's grumble, what frustrates you, ideal game night. No question uses "which card would you pick".

## Domain coverage

Slots: 21 (seven questions, three Domains each). Every Domain in three or four questions. No pair shares more than two questions.

| Domain | Questions | Count | Listed first |
| --- | --- | --- | --- |
| fury | game-night-story, brag-about, makes-you-grin, say-out-loud | 4 | game-night-story |
| calm | say-out-loud, game-night-story, friend-says, their-complaint | 4 | say-out-loud |
| mind | game-night-story, friend-says, makes-you-grin | 3 | friend-says |
| body | say-out-loud, build-around, brag-about | 3 | build-around |
| chaos | build-around, friend-says, makes-you-grin, their-complaint | 4 | makes-you-grin, their-complaint |
| order | build-around, brag-about, their-complaint | 3 | brag-about |

Pair sharing: calm+fury 2, body+fury 2, fury+mind 2, calm+mind 2, body+order 2, chaos+order 2, chaos+mind 2, calm+chaos 2, body+calm 1, body+chaos 1, fury+order 1, chaos+fury 1, calm+order 1. Mind and body never share a question.

## Axis coverage

| Axis | Questions | Count | First answer moves it down |
| --- | --- | --- | --- |
| pace | perfect-win, opening-play, behind-early-mood, ideal-game-night | 4 | behind-early-mood |
| stance | hand-good-day, their-turn, scary-play | 3 | their-turn |
| complexity | reading-new-card, favourite-turn, card-sequence, most-frustrating | 4 | favourite-turn |
| variance | coin-flip-card, all-in-attack, loss-stings-least | 3 | loss-stings-least |

## Checks run

- `corepack pnpm simulate C:/Users/Adastraa/AppData/Local/Temp/riftsign-eval/v4/questions.json` passes. Its numbers are ignored per the brief.
- A throwaway script (not kept) confirmed: Domain counts as above, no pair over 2, no adjacent questions sharing a score, every Domain listed first at least once and not first at least once, no banned words (might, stun, Accelerate, Assault, Deathknell, Tank, conquer, hold, gear, trash), no Domain name in any id, prompts at most 25 words, answers at most 12 words, eyebrows at most 3 words.
