# 0004. Playstyle leads matching

Date: 2026-09-23
Status: Proposed. Amends ADR 0001's distance (weights and the midpoint rule for opposite-pair Legends), and the favourite-champion bonus and Domain lean in docs/specs/0001-riftsign-v1.md.

## Context

An audit of the v1 engine against simulated Players found four problems:

- Domain Axes dominated the distance. A Build's Domain coordinates are always -5, 0 or +5, so they accounted for 79% of the squared distance between Builds. Players who care about how a deck plays got their own Archetype in only 47% of top-three slots.
- Akali, Jayce and Kennen hold both Domains of one Axis, so they sit at 0 on every Domain Axis. Ordinary Legends sit at a pole on two. Any Player whose Domain scores fall below 2.5 in size is geometrically closer to 0 than to a pole, so those three Legends took 40% of #1 results under random clicking, against a 6% share of the pool.
- The favourite-champion bonus was 3 fit points, larger than the median gap between the first and second Match. Naming a Champion often decided the result instead of nudging it.
- The Domain lean named a Domain for any score other than exactly 0, so a Player at -0.5 was told they "lean Fury".

A first fix measured opposite-pair Legends to the nearer pole of their split Axis. Simulation showed it made the attractor worse: at full Domain weight their random-click share rose to 51%, because they now fit anyone leaning either way on that Axis while still sitting at 0 on the other two. The problem is the coordinate model, not the weight.

## Decision

The top Matches are decks that play like you. Playstyle leads the distance, and the Domain-lean section serves Players who choose by Domain.

- **Playstyle term.** Normalised squared distance on the four playstyle Axes, weight 1 each, as before.
- **Domain term, by affinity.** For each of the Legend's two Domains, the Player's affinity runs from -1 to 1: their score on that Domain's Axis over 5, signed so positive points toward the Domain. The Domain costs ((1 - affinity) / 2)², which is 0 at full affinity, 0.25 when neutral and 1 when fully opposed. The Domain term is `DOMAIN_WEIGHT` × the sum of the two costs. A Domain the Legend doesn't hold contributes nothing.
- **Opposite-pair Legends** take the nearer Domain's cost and count the other as neutral (0.25). For a Fury Player, Akali scores like a Fury Legend whose second Domain the Player has no view on.
- Profiles, stored Build coordinates, validation and share URLs are unchanged. Only the distance changed. Fit is 1 minus distance over the maximum distance: all four playstyle gaps at 1 and both Domain costs at 1.
- The favourite-champion bonus is 1 fit point, a tie-break between Matches that are already close. A share link names the top Legend ranked without favourites, because that is what the recipient's view shows.
- The Domain lean names a Domain only where the Profile's score is at least 2.5 from 0 (`DOMAIN_LEAN_THRESHOLD`). Below that the Axis contributes no Domain, and a Player with no qualifying Axis is told their Legends were picked on how they play.

Why the affinity model fixes the attractor by construction: a fully neutral Player pays 0.25 per Domain for every Legend, opposite-pair or not, so they are matched on playstyle alone. Stronger affinity for a Legend's Domains lowers the distance monotonically, and no Legend is rewarded for the Player being undecided.

## Consequences

- `DOMAIN_WEIGHT` is 0.5, chosen on the v2 Questions (2026-10) with `pnpm simulate` (seeded). Against the nearer-pole model at 0.4 on the same Questions:
  - Opposite-pair Legends take 2% of random-click #1s instead of 42%.
  - Balanced playstyle-first Players land on one 3% of the time instead of 53%.
  - Playstyle-first Players get their Archetype in 60% of top-three slots (59%).
  - Noise-free Build recovery is 85% top-1 and 96% top-3 (88% and 100%).
  On the v1 Questions the original engine gave 47% playstyle-first and a 40% attractor.
- Strong-Domain Players get a #1 Legend in their exact Domain pair less often: 67% on v2, against 74% for the nearer-pole model. The Domain-lean section below the top three lists those Legends. `DOMAIN_WEIGHT` 0.6 would give 72% at a cost of two points of playstyle-first.
- Build recovery for opposite-pair Builds drops. A Player standing on Akali's stored coordinates is a balanced Player, and the model deliberately stops giving balanced Players to Akali. Recovery on ordinary-pair Builds is unchanged.
- Fit percentages shift for every Player. A fully neutral Player can't reach 100% with any Legend, because they have no affinity for its Domains. Share links still decode; they just rank differently, as they already do when Legends are added.
- `DOMAIN_WEIGHT` trades playstyle-first accuracy against strong-Domain accuracy with no clear knee (0.3 to 0.8 on v2 runs 65% to 55% against 55% to 80%). Retune it with `pnpm simulate` whenever the Questions change, and keep the close-call margin (0, which fires for 16% of simulated Players on v2) under the same review.
