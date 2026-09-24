# 0004. Playstyle leads matching

Date: 2026-09-23
Status: Proposed. Amends ADR 0001's distance weights and its rule that opposite-pair Legends sit at the midpoint, and the favourite-champion bonus and Domain lean in docs/specs/0001-riftsign-v1.md.

## Context

An audit of the v1 engine against simulated Players found four problems:

- Domain Axes dominated the distance. A Build's Domain coordinates are always -5, 0 or +5, so they accounted for 79% of the squared distance between Builds. Players who care about how a deck plays got their own Archetype in only 47% of top-three slots.
- Akali, Jayce and Kennen hold both Domains of one Axis and sit at 0 on it. Players with no Domain preference also score near 0, so those three Legends collected their results.
- The favourite-champion bonus was 3 fit points, larger than the median gap between the first and second Match. Naming a Champion often decided the result instead of nudging it.
- The Domain lean named a Domain for any score other than exactly 0, so a Player at -0.5 was told they "lean Fury".

## Decision

The top Matches are decks that play like you. Playstyle leads the distance, and the Domain-lean section serves Players who choose by Domain.

- The three Domain Axes weigh 0.4 in the distance and the four playstyle Axes weigh 1. The value is a starting point, to be tuned with `pnpm simulate` once the redesigned Questions land.
- A Legend holding both Domains of an Axis is still stored at 0 there, and validation is unchanged. When distance is computed on that Axis, it is measured to whichever pole (-5 or +5) is nearer the Profile, because the Legend can play either Domain. This replaces ADR 0001's midpoint rule for distance only. Legends with ordinary pairs are unaffected.
- The favourite-champion bonus is 1 fit point, a tie-break between Matches that are already close. A share link names the top Legend ranked without favourites, because that is what the recipient's view shows.
- The Domain lean names a Domain only where the Profile's score is at least 2.5 from 0 (`DOMAIN_LEAN_THRESHOLD`). Below that the Axis contributes no Domain, and a Player with no qualifying Axis is told their Legends were picked on how they play.

## Consequences

- On the v1 Questions (`pnpm simulate`, seeded), playstyle-first Players get their Archetype in 57% of top-three slots, up from 47%. Build recovery stays within a few points (top-1 69%, top-3 94% noise-free).
- Strong-Domain Players get a #1 Legend in their exact Domain pair less often: 61%, down from 85%. The Domain-lean section below the top three lists those Legends, so Domain-first Players still find them.
- The nearer-pole rule on its own makes opposite-pair Legends a closer fit for anyone leaning either way on their split Axis. At the old weights it would raise their share of random-click results from 40% to 51%. Together with the 0.4 weight it lowers that share to 37%, which is still far above their 6% share of the pool. They also sit at 0 on their two other Domain Axes, which is closer than a pole for any Player below 2.5 there. The next weight tuning should watch this number.
- Fit percentages shift for every Player because the maximum distance shrinks with the weights. Share links still decode; they just rank differently, as they already do when Legends are added.
- Persona fixtures kept their Archetypes under the new weights with no expectation changes.
