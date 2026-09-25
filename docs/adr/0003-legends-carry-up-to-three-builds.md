# 0003. Legends carry up to three Builds

Date: 2026-09-23
Status: Accepted. Amends the Legend file shape in the v1 spec (docs/specs/0001-*.md) and ADR 0001's "every Legend has a fixed position". Since ADR 0005 a Build's coordinate covers only the four playstyle Axes; its Domains come from the Legend.

## Context

Every Legend was rated as one Archetype at one Axis position. Players don't all build a Legend the same way. Lux is usually played as Control, but a one-turn-kill Combo list also places at tournaments. A Player who scores Combo never saw Lux, even though Lux Combo is a real deck they could pick up.

## Decision

A Legend holds one to three Builds. A Build is one played way of piloting the Legend: an Archetype, a full seven-Axis coordinate, its own how-it-plays and why-you copy, guide URLs, deck-list link, rating notes and reviewed flag. Card facts (name, Champion, Domains, set, starter deck, image) stay on the Legend.

- Builds on one Legend must have different Archetypes. The Domain half of every Build's coordinate is still derived from the Legend's Domains and checked by validation.
- A Build is added only when relevant decks show it being played (tournament or top-cut lists, meta data, or several independent guides). Nobody pads a Legend out to three Builds.
- Ranking scores each reviewed Build and keeps the closest one per Legend, so a Legend appears once in the results and shows the Build that fits the Player. Its other Builds are named on the Match card.
- `reviewed` is per Build. A new Build lands as an unreviewed draft without pulling the Legend's existing reviewed Build off the site.

## Consequences

- Share URLs and share pages stay per Legend. The Open Graph image lists all of a Legend's reviewed Archetypes.
- `pnpm report` treats each Build as a point, so correlation and centre-cluster checks cover every position a Player can match.
- Persona fixtures rank against every Build, drafts included, so an unreviewed Build that pulls a Persona to the wrong Archetype fails the build before anyone approves it.
