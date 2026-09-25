# 0007. No favourite champions

Date: 2026-09-24
Status: Accepted (approved by the maintainer 2026-09-24, with docs/specs/0003-riftward-redesign.md). Supersedes item 3 ("Has the look you like") and item 4 (the full ranking) of ADR 0005's result page.

## Context

ADR 0005 removed the favourite-champion bonus, so favourites stopped changing fit. They survived as an optional step after the last Question and a "Has the look you like" section on the result page, showing the best-fitting Legend of the champions the Player picked. The redesign adds an Explore carousel that holds every Legend, ranked by fit and searchable by name. A Player who cares about a champion's look can find that champion there, with the same fit and the same honest comparison with their scores. The champion step and the section became a second, weaker way to do the same thing.

## Decision

- The quiz ends at the last Question. Next on that Question shows the result. The champion step is gone.
- Favourite champions no longer affect or appear on the result page. "Has the look you like", `favouritePick` and the champion list are removed.
- The session no longer stores favourite champions. A saved session that still has them loads, and they are ignored.
- The collapsible full ranking is removed too. Exploring other Legends, whether by fit or by name, happens in the Result page's Explore carousel.

## Consequences

- The Profile, matching and share format are unchanged, since favourites never reached any of them after ADR 0005.
- Until the Explore carousel ships, the result page shows only the top two Matches and the Domain-lean Legends.
- `playstyleGaps` and `GAP_WORDS` stay. Explore's "Compared with you" summary reuses the gap wording.
