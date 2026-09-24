# 0005. Six independent Domain scores

Date: 2026-09-23
Status: Accepted (approved by the maintainer 2026-09-23). Supersedes ADR 0001's three bipolar Domain Axes, and the parts of ADR 0004 on the opposite-pair rule, the favourite-champion bonus and the Domain lean. This is a new major version of the Profile and the share format. Its Questions section and highlight threshold are superseded by ADR 0006.

## Context

ADR 0001 scored Domains on three bipolar Axes (Fury/Calm, Mind/Body, Chaos/Order), and noted that opposite-pair Legends might one day force six independent affinities. On a bipolar Axis, liking Fury means disliking Calm. So a Player who enjoys both halves of a pair can't say so, and Akali, Jayce and Kennen needed a special case in matching (ADR 0004). The v2 evaluation (docs/research/2026-09-23-quiz-v2-evaluation.md) also found that the #3 Match was often a weaker neighbour, and that the favourite bonus was the wrong tool for Players who choose by a champion's look.

## Decision

**Profile.** Ten scores, all 0 to 10: the four playstyle Axes (unchanged ids) and six Domain scores, `fury`, `calm`, `mind`, `body`, `chaos` and `order`. On a Domain score, 5 means no feeling either way, and liking one Domain says nothing about its old opposite. Each score is 5 + (raw / reach) × 5, as per-Axis scoring was before. Variance is tightened to luck, gambles and all-or-nothing swings; a payoff the Player assembles themselves is complexity.

**Questions.** Moves use the ten ids. A Domain forced choice between X and Y is zero-sum: the X answer moves X +2 and Y −2, and "Leaning" gives half. Pairings cover the old opposite pairs and cross pairs, and each Domain appears in at least three Domain items. Validation counts loads and reverse keying on all ten scores. A Domain also needs a forward-keyed load. In a zero-sum item the first Answer always raises one Domain and lowers the other, so every such item is reverse-keyed for one of its Domains by construction. "Has a reverse-keyed load" then only means "isn't always listed first", and a Domain that is always listed second would lose to first-option bias.

**Legend data.** A Build stores only the four playstyle Axes; its Domains come from `legend.domains`. All 49 Legend files were migrated mechanically (`scripts/migrate-drop-domain-coordinates.ts`), and validation rejects a stored Domain coordinate.

**Matching.** Playstyle distance is unchanged, including clamping to the pool's Build range. For each of the Legend's two Domains, affinity a = (score − 5) / 5 and cost ((1 − a) / 2)². The Domain term is `DOMAIN_WEIGHT` × the sum of the two costs. Opposite-pair Legends need no special case, and a fully neutral Player pays the same for every Legend. The favourite-champion bonus is removed; favourites no longer change fit.

**Share URL.** Format 2 is `2.<questionSetVersion>.<20 base36 chars>`: the ten scores in tenths, two characters each, in the order above. Format 1 links still decode. An old score fc on Fury/Calm (−5 to 5) becomes fury = 5 − fc and calm = 5 + fc, and likewise for Mind/Body and Chaos/Order. They carry an older Question-set version, so they show the existing "earlier version of the test" notice.

**Result page.**

1. The headline shows the top two Matches ("Legends that play like you"), with the close-call line.
2. "Your Domains" shows six bars and highlights the one or two Domains that clearly lead. That means the top two, if both score at least `DOMAIN_HIGHLIGHT_THRESHOLD` above 5 and the second is strictly ahead of the third; otherwise the top one on the same terms; otherwise none. A tie at the cut would make the pick arbitrary, so tied Domains are left out. Below the bars sit the other Legends holding that pair (or that one Domain), in fit order. With no clear lead, a friendly line replaces the list. Bar labels ("Strong pull", "No strong pull", "Not a draw") use the same threshold, so a bar never claims a pull the section denies.
3. "Has the look you like" appears when the Player named favourite champions. It shows the best-fitting Legend of those champions not already on the page, with an honest line on how its playstyle differs from the Player's scores, one band (2 points) or more ("It's faster and swingier than you like").
4. The full ranking is unchanged.

## Consequences

Tuned with `pnpm simulate` (seeded) on the reviewed v3 set (2026-11, 27 Questions, docs/research/2026-09-24-question-redesign-v3.md). The simulation's respondent model never answers "Definitely" for a loved Domain against a neutral one, because the strong answer overshoots the neutral side. So it also simulates "mostly-Definitely fans", who answer "Definitely" for a loved Domain three times in four.

- **Weight.** `DOMAIN_WEIGHT` stays 0.5. There is no knee:

  | Weight | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.8 |
  | --- | --- | --- | --- | --- | --- | --- |
  | Playstyle-first share (top 3) | 68% | 64% | 62% | 60% | 58% | 54% |
  | Fans' #1 holds their pair | 55% | 65% | 74% | 79% | 84% | 91% |

  At 0.5, playstyle-first matches v2 (59%). The skew described below persists at every weight from 0.3 up, so weight is not the lever for it.
- **Threshold.** `DOMAIN_HIGHLIGHT_THRESHOLD` is 3 (was 2.5). Each Domain has reach 8, so four "Leaning" answers the same way give exactly 7.5. Any cut below 3 lands there, and anything at 3 or above needs a fifth point (8.1). The choice is binary:

  | Threshold | 1.5 | 2 | 2.5 | 3 | 3.5 |
  | --- | --- | --- | --- | --- | --- |
  | Neutral Players kept quiet | 64% | 64% | 64% | 100% | 100% |
  | Indifferent power pickers kept quiet | 17% | 17% | 17% | 67% | 100% |
  | Fans: pair named | 99% | 89% | 89% | 56% | 24% |
  | Fans of both Domains of an old opposite pair: both named | 98% | 84% | 84% | 40% | 0% |

  At 3, a clear lead needs at least one "Definitely", and no Player without any Domain feeling is told they have one. A third of power pickers (below) are, because one judge's picks put Mind at 8.1. Fans reach 8.6 on average on their two Domains, and fans of both halves of an old pair reach 8.3. Their misses mostly come from the item that pits their two loved Domains against each other, where they only lean.
- **Indifferent power pickers.** A Player with no Domain feelings who takes whichever answer is the stronger card. The first set, judged by its author, put this Player at Fury 1.9, Calm 5, Mind 7.5, Body 6.9, Chaos 4.4, Order 4.4, and their #1 held Fury 0% of the time. A power-balance pass rewrote answer text only, checked by three blind judges who saw the items with answer order shuffled and Domains hidden (docs/research/2026-09-24-question-redesign-v3.md §7). `pnpm simulate` now takes its power picks from those judges. Their mean is Fury 4.8, Calm 3.8, Mind 6.0, Body 4.4, Chaos 6.0, Order 5.0, and the #1 holds Fury / Calm / Mind / Body / Chaos / Order 33% / 19% / 59% / 17% / 48% / 24% (Domain-neutral Players: 33% / 31% / 32% / 43% / 29% / 33%). The judges disagree with each other by about as much as the remaining skew, so wording, not weight, is still the lever.
- **Old opposite pairs.** Players who love both Fury and Calm (or Mind and Body, Chaos and Order) now get that pair at #1 30% of the time under the model, and 56% as fans (the interim set managed 0%). Opposite-pair Legends take 7% of random-click #1s, against a 6% pool share: no attractor.
- **Personas.** Eight Personas answer the v3 set honestly, including one who loves Fury and Calm. All land on their expected Archetypes and leading Domains.
- **Records.** Share links from v1 and v2 keep working. The v3 link is 20 characters of scores, up from 14. Personas now assert the leading Domains instead of dominant Domain Axes.
