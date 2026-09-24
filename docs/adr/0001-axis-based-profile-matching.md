# 0001. Axis-based profile matching for results

Date: 2026-09-20
Status: Accepted. The three bipolar Domain Axes are superseded by ADR 0005 (six independent Domain scores); the playstyle Axes and profile matching stand.

## Context

Riftsign recommends Riftbound Legends to a Player based on playstyle preferences. The Legend pool is 49 today and grows by roughly 12 every quarter. Riot has already broken one assumption (Vendetta introduced Legends with opposite Domain pairs), so the pool's shape will keep changing.

The hard requirement: adding a Legend must never require editing Questions. Otherwise every set release becomes a quiz rewrite.

We surveyed how comparable quizzes score (see docs/research/2026-09-20-scoring-models.md). Point-tally quizzes (MTG color tests) and decision trees (Pokemon starter quizzes) both require touching questions or tree logic per new result. Pairwise ranking requires comparing a new Legend against every existing one. Continuous trait profiles (IPIP-NEO) and vector matching against a catalog (Open Source Psychometrics character test) satisfy the requirement.

## Decision

Score the Player on seven fixed continuous Axes:

- Four playstyle Axes (0 to 10): Pace, Stance (proactive vs reactive), Complexity, Variance.
- Three bipolar Domain Axes (-5 to +5) mapping Riftbound's opposite pairs: Fury/Calm, Mind/Body, Chaos/Order.

Every Legend has a fixed coordinate on all seven Axes. Domain coordinates come from the card; playstyle coordinates are drafted from published guides and reviewed by a human. Matches are ranked by weighted Euclidean distance after normalizing each Axis to a common range. The Player's Profile (their Riftsign) is the primary result; Legends are recommendations hanging off it.

Legends with opposite Domain pairs sit at the midpoint of that Domain Axis. Accepted: three of 49 Legends today.

Question design constraints that follow: at least three Questions load each Axis, every Axis has at least one reverse-keyed Question, scenario choices are preferred over agree/disagree statements, and scores are shown as bands alongside numbers.

## Consequences

- New Legend = one data file with coordinates and copy. Questions untouched.
- The share URL encodes seven scores plus a version tag. Changing the Axis set is a breaking change to every existing link, so Axes are frozen once launched and only a new major version can change them.
- Legend coordinates must be audited for inter-Axis correlation and for clustering at the center once all 49 are rated. Persona tests run on every build to catch drift.
- If Riot makes opposite-pair Legends common, the Domain Axes may need to become six independent affinities. That would be a new major version.
