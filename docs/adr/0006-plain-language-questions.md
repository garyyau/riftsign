# 0006. Plain-language Questions with their own answer copy

Date: 2026-09-24
Status: Accepted (approved by the maintainer 2026-09-24). Supersedes the Questions section and the highlight threshold of ADR 0005. The Profile, matching, share format and result page are unchanged.

## Context

The 2026-11 set (ADR 0005) measured playstyle well but Domains poorly. On the 16-player panel, Calm and Order ranked Players barely better than chance (rho about 0.45), and almost all of the matching regret came from Domain scores. Two causes showed up in the answers:

- **Zero-sum pairs.** Each Domain item was a two-card forced choice, +2 to one Domain and −2 to the other. A Player indifferent to both sides still moved both, and a Player who liked both had to hide one.
- **Card text.** Items named might, stun, Accelerate, runes and conquer. Newer Players told us they were guessing ("I don't even fully remember what my Legend's ability does").

The maintainer also found the quiz too technical to be fun, and the "Definitely / Leaning" strength scale odd. Written answers describe what a Player would actually do, which people find easier than a strength rating. The goal is a fun discovery tool, so a small loss in measured accuracy was acceptable in exchange for a quiz that reads well. In the end no loss was needed (docs/research/2026-09-24-quiz-v4-evaluation.md).

## Decision

**Plain language.** Every Question is a concrete moment a two-week player can picture, with no Legend, Champion, Archetype or Domain names. Card words are limited to what the first game teaches: unit, spell, rune, attack, battlefield, card, hand, deck and turn. Every Answer is its own line of copy. Each Question uses a different kind of framing, such as a story after game night, a line you'd say out loud, or what a friend would say about how you play.

**Playstyle Questions.** Each Question measures one Axis, with 3 or 4 graded answers listed from one end to the other (for example +2, +1, −1, −2). An answer that sits in the middle moves nothing.

**Domain Questions.** Each Question offers three Domain answers and a "none of these grab me" answer listed last. Picking a Domain gives it +2 and each of the other two −1. The "none" answer moves nothing. Every Domain appears in 3 or 4 of the 7 Domain Questions. A Player who picks at random ends near 5 on every Domain, and indifference can be answered as indifference.

**Scoring.** A score now uses one reach for both directions: the furthest the set can push it either way. Under separate reaches, a Domain the Player passed over three times (−1 each) would have scored 0, reading "chose something else" as "hates this". Symmetric Questions score exactly as before.

**Strength scale removed.** `scale` scenarios, their four expanded points and the "Definitely / Leaning" labels are gone. Answers may have no moves.

**Threshold.** `DOMAIN_HIGHLIGHT_THRESHOLD` is 2.5 (was 3). A Domain sits in three or four choices, so picking it twice and passing once lands near 7.5. At 2.5, `pnpm simulate` names a fan's pair 73% of the time and both Domains of an old opposite pair 82% of the time, and still stays quiet for every Domain-neutral Player. At 3 those figures are 38% and 36%.

## Consequences

- The quiz goes from 27 Questions to 21.
- On the panel, playstyle accuracy is the best of any version (stance MAE 0.99, variance 1.00, complexity 1.02) and Domain accuracy is at v3's level. Mind needed four appearances; with three it was crowded out by Calm and Chaos for control players.
- The power-picker simulation is dropped. Its picks came from blind judges of the 2026-11 items and don't carry over. The maintainer accepted that some answers may sound more appealing than others.
- The Question-set version changes, so earlier share links show the "earlier version of the test" notice.
- Personas were re-answered for the new set. The puzzle-loving combo Persona is a known failure: every Combo Build is rated variance 6 or higher, so a combo player who hates luck lands on Control. That's a Legend-rating issue, to be fixed in the Legend-quality review.
