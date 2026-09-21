# Spec 0001: Riftsign v1

Status: Accepted 2026-09-20 (seams confirmed by maintainer)
Date: 2026-09-20
Related: CONTEXT.md, docs/adr/0001-axis-based-profile-matching.md, docs/adr/0002-fan-project-data-lane.md, docs/research/*

## Problem Statement

A Player who has learned Riftbound's rules faces 49 Legends across four sets, with a new set every quarter. Deck guides and tier lists assume vocabulary the Player doesn't have yet (aggro, tempo, midrange) and rank decks by tournament strength, not by whether the Player would enjoy piloting them. There is no tool that asks the Player how they like to play and points them at Legends that fit. The Player either picks by champion art, buys a starter deck at random, or bounces off the game.

The maintainer of such a tool faces a second problem: every set release adds about twelve Legends, and a quiz whose questions encode the results has to be rewritten each time.

## Solution

Riftsign is a static website. The Player answers roughly two dozen scenario and preference Questions in under five minutes. The site computes their Riftsign: a Profile of seven scores covering pace, stance, complexity, variance, and three Domain leans. The result page shows the Profile as numbers and plain-language bands, names the Player's primary Archetype in beginner-friendly words, and ranks every reviewed Legend by fit, spotlighting the top three with a card image, a short "how it plays" and "why you'd like it", starter-deck availability, and a link to deck lists on Piltover Archive. The Player can share a link that rebuilds their result, and returns later to find their answers kept locally.

The maintainer adds Legends by running an Ingestion command that drafts each new Legend's rating from published guides, then reviewing and approving one file per Legend. Questions never change when Legends are added.

## User Stories

Player: taking the test

1. As a Player, I want to start the test from the landing page with one tap, so that I'm not asked to sign up or read instructions first.
2. As a Player, I want to see how many Questions remain, so that I know the test is short and keep going.
3. As a Player, I want Questions phrased as game situations and preferences rather than deck jargon, so that I can answer honestly without knowing what "tempo" means.
4. As a Player, I want to go back and change a previous Answer, so that a mis-tap doesn't skew my Riftsign.
5. As a Player, I want an optional final Question about champions I already love, so that my result leans toward them without forcing me to name any.
6. As a Player, I want to skip the champion Question, so that not knowing League of Legends doesn't affect my result.
7. As a Player, I want the test to work on my phone at a game store, so that I can take it between rounds.
8. As a Player, I want my in-progress Answers to survive a page refresh, so that an accidental reload doesn't restart me.

Player: reading the result

9. As a Player, I want to see my seven scores as numbers, so that my result feels like mine and not a generic label.
10. As a Player, I want each score paired with a plain-language band such as "strongly fast", so that I understand what the number means.
11. As a Player, I want my primary Archetype named with a two-sentence description in plain words, so that I learn the vocabulary the community uses.
12. As a Player, I want the top three Legend Matches shown with card art, so that the result feels concrete and exciting.
13. As a Player, I want each Match to show a fit percentage, so that I can tell a strong match from a marginal one.
14. As a Player, I want each Match to explain in one paragraph why it fits me, so that I can judge the recommendation.
15. As a Player, I want each Match to say whether a retail starter deck exists, so that I know if I can buy in cheaply.
16. As a Player, I want each Match to link to deck lists on a community database, so that I have a next step.
17. As a Player, I want to expand a full ranking of every Legend, so that I can see where the ones I was curious about landed.
18. As a Player, I want to see my Domain lean and other Legends that share those Domains, so that I can explore beyond the top three.
19. As a Player, I want to know the result is about fit rather than tournament strength, so that I don't mistake it for a tier list.
20. As a Player, I want to retake the test, so that I can see how my Riftsign changes as I learn.

Player: sharing and returning

21. As a Player, I want a share button that copies a link, so that I can post my Riftsign to friends.
22. As a Player, I want a friend who opens my link to see my exact scores and Matches without taking the test, so that we can compare.
23. As a Player, I want the shared link to show a preview image naming my top Legend, so that the post looks good in chat apps.
24. As a Player, I want my result kept on my device, so that I can come back to it later without the link.
25. As a Player, I want to be told if the test has changed since I took it, so that I know a retake might give a different result.
26. As a Player, I want an old share link to keep working after new Legends are added, so that my post never breaks.
27. As a Player, I want the site to state it is a fan project not endorsed by Riot, so that I understand what I'm looking at.

Maintainer: ingesting Legends

28. As a Maintainer, I want to run one command after a set release, so that adding Legends is a routine chore not a project.
29. As a Maintainer, I want the command to discover which Legends are new compared with the repository, so that I don't have to track releases by hand.
30. As a Maintainer, I want the command to fall back to me typing the Legend's name, Champion, Domains, and set, so that an unavailable feed never blocks me.
31. As a Maintainer, I want the command to find and read two or three published guides per Legend, so that ratings are grounded in how the deck actually plays.
32. As a Maintainer, I want the command to draft axis coordinates, an Archetype, and Player-facing copy per Legend, so that I review rather than write.
33. As a Maintainer, I want each draft written as its own file marked unreviewed, so that I can approve Legends one at a time.
34. As a Maintainer, I want unreviewed Legends excluded from the published site, so that a half-finished ingestion can never reach Players.
35. As a Maintainer, I want a checklist of files to review printed at the end, so that I know exactly what to look at.
36. As a Maintainer, I want to re-rate a single existing Legend by name, so that I can act when a guide changes my mind.
37. As a Maintainer, I want the command to download the card image into the repository, so that the site never depends on a third-party host.
38. As a Maintainer, I want the command to record which guide URLs informed each rating, so that a rating can be revisited later.

Maintainer: quality and confidence

39. As a Maintainer, I want the build to fail when a Legend or Question file is malformed, so that data errors never ship.
40. As a Maintainer, I want the build to fail when any Axis has fewer than three Questions loading it, so that the Profile stays statistically meaningful.
41. As a Maintainer, I want the build to fail when any Axis lacks a reverse-keyed Question, so that acquiescence bias is always countered.
42. As a Maintainer, I want Persona fixtures run on every build, so that Question or rating edits that move a Persona to the wrong Archetype are caught immediately.
43. As a Maintainer, I want a report of inter-Axis correlation across Legend coordinates, so that I notice when two Axes have become redundant.
44. As a Maintainer, I want a report of how tightly Legends cluster near the center of Axis space, so that I notice when generalist Legends would win too often.
45. As a Maintainer, I want the site to deploy automatically when I push to the main branch, so that publishing is not a manual step.

## Implementation Decisions

Vocabulary follows CONTEXT.md. Scoring model follows ADR 0001. Data and legal posture follows ADR 0002.

Architecture

- Single-page static site. Vite, React, TypeScript, Tailwind, pnpm. Deployed to GitHub Pages by a CI workflow on push to main. No server, no runtime network calls except loading the site's own assets.
- Two data collections committed to the repository: Questions and Legends. Both validated against schemas at build time. The site imports them as typed data.
- One pure scoring module with no React or browser dependencies. It exposes: compute a Profile from a Question set and a set of Answers; rank a Legend pool against a Profile producing ordered Matches with fit percentages; derive the primary Archetype from a Profile; encode a Profile to a compact string and decode it back. Everything Player-facing is a view over this module's output.

Axes

- Seven Axes, fixed for v1 as listed in ADR 0001. Each Axis has an id, a low label, a high label, and band thresholds with band labels ("strongly slow" through "strongly fast").
- Playstyle Axes present as 0 to 10. Domain Axes present as -5 to +5 with the Domain names as pole labels. Internally all Axes are normalized to the same range before distance is computed.

Questions

- Each Question has an id, prompt text, a kind (scenario with two to four Answers, or a five-point statement), and Answers. Each Answer carries a list of Axis movements: an Axis id and a signed weight. An Answer may move more than one Axis.
- Each Question declares which Axes it primarily loads and whether it is reverse-keyed for each. The build verifies three or more loading Questions per Axis and at least one reverse-keyed Question per Axis.
- The optional champion Question is a multi-select of Champion names drawn from the Legend pool. It does not move Axes. Selected Champions apply a small fixed bonus to the fit of Legends of those Champions at ranking time.
- Questions carry a Question-set version string. Bumping it is a manual decision when Question content changes.

Legends

- One file per Legend. Fields: id, name, champion, domains (exactly two), set code, starter deck (product name or none), archetype (one of Aggro, Tempo, Midrange, Control, Combo), coordinates for all seven Axes, how-it-plays (two sentences), why-you (one paragraph in second person), guide URLs, card image filename, deck-list link, reviewed flag, ingestion date, rating notes.
- Domain coordinates are derived from the two Domains, not entered by hand: +5 or -5 toward each named Domain on its Axis, 0 on an Axis where the Legend holds both opposite Domains, 0 on the untouched Axis. The build recomputes and rejects a file whose stored Domain coordinates disagree.
- Only Legends with reviewed set to true are included in the built site.

Matching

- Distance is weighted Euclidean over normalized Axes. Weights default to 1 per Axis and live in one configuration record so an audit can adjust them.
- Fit percentage is derived from distance relative to the maximum possible distance in the normalized space, so it is stable as the pool grows.
- Primary Archetype is the archetype of the top Match unless the top two Matches disagree and their fits are within a small margin, in which case the Archetype whose Legends have the higher mean fit in the top five wins. This keeps the headline stable near boundaries.
- Domain lean surfaces the two Domain Axes with the largest magnitude and lists reviewed Legends sharing that Domain pair, excluding those already in the top three.

Sharing and persistence

- The share URL carries the Profile in the fragment: a format version, the Question-set version, and the seven scores, encoded compactly. Answers are not in the URL. The result page decodes the fragment and ranks against the current reviewed pool, so old links keep working and gain new Legends.
- Local storage holds the Answers, the Question-set version answered against, and the last encoded Profile. On return, if the stored version differs from the current one, the result page shows a notice offering a retake.
- One static Open Graph image per Legend, generated at build time from the card image and Legend name. The share URL points at a per-Legend result path so link previews resolve to the top Match's image.

Result presentation

- Four playstyle Axes render as horizontal banded bars with the numeric score and band label. Three Domain Axes render as dual-pole sliders with the two Domain names at the ends and a marker between. No radar chart in the page body; a small radar may appear only on the static share image as a decorative shape.
- Scores are revealed one Axis at a time on first view, then settle into the full summary. Returning or shared views skip the reveal.
- Top three Matches with card image at the true 5:7 card ratio, fit percentage, archetype badge, how-it-plays, why-you, starter-deck badge, and deck-list link. Below, a collapsed full ranking.
- Domain colors appear only as small badges and on the Domain sliders, desaturated so six accents never compete. They are never used as backgrounds.
- A visible one-line note that fit is about playstyle, not competitive strength.
- Footer carries the verbatim Legal Jibber Jabber disclaimer with the project title. No Riot logos anywhere.

Visual direction ("Signal": dark, one accent, editorial)

- Chosen from three researched directions (docs/research/2026-09-20-design-directions.md). Dark near-black background, greyscale surfaces separated by hairline borders rather than shadows, one accent color used only for the Archetype headline, primary action, focus ring, and the reveal moment, where a restrained glow or gradient is allowed.
- Shares DNA with the maintainer's riftbound-collectr-sync site (dark, single accent, condensed display type, monospace uppercase eyebrow labels, border-first, numbered-section layout) but must read as a sibling, not a clone: a different accent hue (not acid lime), a different display face, a small corner radius instead of fully square, and card art as the dominant visual on the result page.
- Type: a geometric or grotesque display face for headlines (Space Grotesk or General Sans), Inter for body, JetBrains Mono for eyebrow labels, scores, and badges. Fonts self-hosted so the site has no third-party requests.
- The quiz flow borrows the numbered-step rail from the sibling: Question number and Axis-neutral eyebrow label in a left rail on desktop, stacked on mobile. Progress is a slim top bar.
- Motion is CSS transitions only, plus one scripted reveal sequence on the result page. No animation library.

Stack conventions (carried from riftbound-collectr-sync where they fit)

- Tailwind v4 with CSS-first theming: tokens as CSS variables in one stylesheet, no JavaScript config. shadcn/ui new-york primitives on Radix with cva variants and a cn helper. lucide-react icons.
- Pure logic in a lib folder with colocated Vitest tests. Components split into ui primitives and feature components. Kebab-case filenames. Path alias to src.
- oxlint for linting. TypeScript with unused-locals and unused-parameters errors on.
- Difference from the sibling: pnpm (new project), zod schemas for the Question and Legend collections because the build must fail loudly on bad data, and a GitHub Pages deployment workflow because this site is meant to be public under the fan policy.

Ingestion command

- A repo-local Claude Code slash command, authored per the writing-for-agents skill. Steps: obtain candidate Legends (Riftcodex fetch of sets and Legend-type cards, collapsed by identity, or manual entry), diff against Legend files by id, and for each new or named Legend: search for and fetch two or three guide pages, draft coordinates and copy grounded in those pages and the card text, download the card image, write the file with reviewed false, and finally print a review checklist. Accepts a Legend name to re-rate one existing Legend.
- Riftcodex is credited in the README as a development tool. It appears nowhere in the site.

Quality gates

- Build-time validation of both collections, the per-Axis Question counts, reverse-keyed coverage, and Domain coordinate consistency.
- Persona fixtures: seven fixed Answer sets (one per Archetype, two Domain leans) with expected primary Archetype and, for Domain leans, expected dominant Domain Axes. Run as tests on every build.
- A report script prints the inter-Axis correlation matrix across reviewed Legend coordinates and the share of Legends within a central radius. Informational, not a gate, in v1.

## Testing Decisions

A good test exercises the scoring module through its public interface with realistic data and asserts on what a Player or Maintainer would observe: the Profile, the ranking, the Archetype, the encoded string. Tests do not inspect intermediate distances, normalization internals, or component state.

Seams, highest first:

1. Scoring module boundary. Input: Question set, Legend pool, Answers. Output: Profile, ranked Matches, Archetype. Persona fixtures live here. This is the primary seam and carries most tests.
2. Profile encode/decode. Round-trip property tests and fixed-string compatibility tests so a v1 link decodes identically forever.
3. Data validation. The real committed Questions and Legends pass; hand-built invalid fixtures fail with the expected reason.

The React layer is exercised by a small number of rendering smoke tests at most. No end-to-end browser suite in v1.

Prior art: none, this is a new repository. Vitest is the test runner.

## Out of Scope

- Any runtime LLM or chat feature. The data model is agent-ready, but no agent ships in v1.
- Meta or tier-list awareness in matching or display.
- Hosting deck lists or full card data. Only Legend metadata and one image per Legend.
- Official Riot API integration.
- Localization beyond English. Strings are centralized to keep it possible.
- Per-Profile dynamic share images. One static image per Legend only.
- Accounts, analytics, or any server component.
- Automatic or scheduled ingestion. The command is run by hand.
- Rating the 49 existing Legends is Ingestion work performed with the command after it exists, not part of building the site. The research table is a seed only.

## Further Notes

- Radiance releases on 2026-10-23 and is the first real ingestion. The command should exist and be exercised on the existing 49 before then.
- Vendetta introduced Legends holding opposite Domains (Kennen, Jayce, Akali). They sit at the midpoint of that Domain Axis by design. If this becomes common, the Axis model changes in a new major version per ADR 0001.
- The Maintainer intends to email Riftcodex's maintainers to confirm snapshot use. Non-blocking.
- Questions themselves are a design deliverable. A calibration pass with Sonnet role-playing personas grounded in community guides is planned once before launch, as a one-off, not a permanent gate.
- Research supporting these decisions is in docs/research, dated 2026-09-20.
- The sibling project riftbound-collectr-sync chose to stay unhosted because its card lists came from a third-party collection app, which Riot's digital-tools policy treats as unofficial sourcing. Riftsign's exposure is narrower (Legend metadata typed or confirmed by hand, one official card image per Legend, no card lists) and it relies on the fan-content policy rather than the developer policy. Keep it that way: never add card lists, prices, or bulk card data to this repository.
