# 0005. Six independent Domain scores

Date: 2026-09-23
Status: Accepted (approved by the maintainer 2026-09-23). Supersedes ADR 0001's three bipolar Domain Axes, and the parts of ADR 0004 on the opposite-pair rule, the favourite-champion bonus and the Domain lean. This is a new major version of the Profile and the share format.

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

- **Weight.** `DOMAIN_WEIGHT` stays 0.5, tuned with `pnpm simulate` on the interim 2026-11 set. From 0.3 to 1.0, playstyle-first runs 64% to 53% (top-3 slots) against strong-Domain #1 pair hits of 50% to 73%, with no knee. At 0.5 playstyle-first matches v2 (59%), and v2's own strong-Domain population (love a pair, dislike its opposites) gets its pair at #1 70% of the time, against 68% on v2.
- **Threshold.** `DOMAIN_HIGHLIGHT_THRESHOLD` is 3 (was 2.5). On the interim set, always answering "Leaning" the same way tops out at 7.5. A Player with no Domain preference also reaches 7.5 by chance, so no threshold at or below 2.5 can tell those Players apart:

  | Threshold | 1.5 | 2 | 2.5 | 3 | 3.5 |
  | --- | --- | --- | --- | --- | --- |
  | Neutral Players kept quiet | 65% | 68% | 73% | 100% | 100% |
  | Pair named, Player answers "Definitely" (v2 population) | 100% | 100% | 100% | 100% | 97% |
  | Pair named, Player only ever leans | 89% | 77% | 50% | 0% | 0% |

  At 3 a clear lead needs some "Definitely" answers. 2 is the alternative if the redesigned Questions can't lift real Domain lovers past 8.
- **Interim numbers.** The 2026-11 set is a mechanical conversion of 2026-10 that only pits old opposites against each other, so it can't express liking both. Players who like both Domains of an old opposite pair get neither highlighted and never get that pair at #1 (0%). Fury + Calm always sums to 10, so opposite-pair Legends never beat the neutral cost and take 0% of random-click #1s (pool share 6%). A neighbour slip on a 4-point scale can turn "Leaning Fury" into "Leaning Calm", which is part of why Build recovery with slips drops from 70% to 58%. The redesigned Domain Questions replace this set; retune both constants, and redo the Personas, when they land.
- **Records.** Share links from v1 and v2 keep working. The v3 link is 20 characters of scores, up from 14. Personas now assert the leading Domains instead of dominant Domain Axes.
