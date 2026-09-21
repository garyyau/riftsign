---
description: Ingest new Riftbound Legends (or re-rate one by name) into src/data/legends as unreviewed drafts grounded in published guides.
argument-hint: "[Legend name to re-rate]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, Agent
---

Ingestion: add newly released Legends to the Match pool, or re-rate one existing Legend. Every draft you write is `reviewed: false`; the Maintainer approves files by hand. Questions are never touched.

Vocabulary: `CONTEXT.md`. Scoring model and the meaning of each Axis: `docs/adr/0001-axis-based-profile-matching.md` and `src/lib/axes.ts`. Legend file shape: `src/lib/schemas.ts` (`legendSchema`); any existing file in `src/data/legends/` is a worked example.

Argument: `$ARGUMENTS`. Empty means "discover and ingest everything new". A Legend name means "re-rate that one Legend only" (steps 3 to 6 for that file; discovery is skipped).

## 1. Candidates

Fetch `https://api.riftcodex.com/sets`, then for each set id `GET https://api.riftcodex.com/cards?set_id=<ID>&size=100&page=<n>` until a page returns fewer than 100 cards. Keep cards whose `classification.type` is `Legend`. Collapse variants to one identity by stripping the parenthetical and "Overnumbered" suffixes from `name` (e.g. `Vi - Piltover Enforcer (Signature)` and `Vi - Piltover Enforcer` are one Legend). Printed names use a comma: `Vi, Piltover Enforcer`. For each identity record name, champion (`tags[0]`), the two `classification.domain` values, `set.set_id`, and `media.image_url` (Riot CMS).

Riftcodex is a development convenience with no published terms. If it is down or the shape has changed, fall back: ask the Maintainer for each Legend's name, Champion, two Domains, and set code, and continue with manual entry. Never block on the feed.

Done when: a candidate list exists with all five facts per Legend, or the Maintainer has typed them.

## 2. Diff

Compute each candidate's id: lowercase, drop apostrophes and periods, non-alphanumerics to single hyphens (`Kai'Sa, Daughter of the Void` → `kaisa-daughter-of-the-void`). New Legends are candidates whose `src/data/legends/<id>.json` does not exist. A set code missing from `SET_CODES` in `src/lib/types.ts` needs adding there first; tell the Maintainer and add it.

Done when: the list of new ids is printed, or "nothing new" is printed and the command ends.

## 3. Guides

For each new or named Legend, search for two or three published guides that describe how the deck plays (riftbound.gg, skillshotzgaming.com, riftboundguide.com, and similar). Fetch each. Skip paywalled or empty pages and find another. Record the URLs you actually read; they go in `guideUrls`.

Done when: at least two guide pages have been read per Legend, or one page plus the card text with a note in `ratingNotes` saying only one guide was found.

## 4. Rate

Draft, grounded in the guides and card text:

- `archetype`: Aggro, Tempo, Midrange, Control, or Combo.
- Playstyle coordinates, 0 to 10 in half steps: `pace` (slow → fast), `stance` (reactive → proactive), `complexity` (simple → intricate), `variance` (steady → swingy). Write a one-line justification per Axis in `ratingNotes`, quoting or paraphrasing the guide that supports it.
- Domain coordinates: call `domainCoordinates(domains)` from `src/lib/schemas.ts` (or copy the rule: -5/+5 toward each Domain on its Axis, 0 on an Axis where both Domains are held, 0 on the untouched Axis). Never estimate these.
- `howItPlays`: two sentences, present tense, no jargon a new player lacks.
- `whyYou`: one paragraph in second person explaining who enjoys piloting this Legend.
- `starterDeck`: the retail product name, or `null`. Check the guides or the official product page; do not infer from set.
- `deckListUrl`: `https://www.piltoverarchive.com/decks` (the archive has no per-Legend URL).

Compare against two or three existing rated Legends of the same Archetype so coordinates are relative to the pool, not absolute guesses.

Done when: every field of `legendSchema` has a value and each playstyle Axis has a justification line.

## 5. Image

Download `media.image_url` for the standard (non-Signature) printing to `public/cards/<id>.jpg` (convert PNG to JPEG with sharp if needed: `pnpm tsx -e "..."`). Set `cardImage` to `<id>.jpg`. When no image is reachable, leave the file absent, set `cardImage` anyway, and add the gap to the checklist.

Done when: the file exists on disk or the gap is on the checklist.

## 6. Write and validate

Write `src/data/legends/<id>.json` with `reviewed: false` and `ingestedAt` set to today (YYYY-MM-DD). For a re-rate, keep `reviewed: false` too so the change is re-approved. Run `pnpm validate`; fix every issue it reports before moving on.

Done when: `pnpm validate` prints `Data OK`.

## 7. Checklist

Print, for the Maintainer:

```
Review these files, then set "reviewed": true on each you approve:
  src/data/legends/<id>.json   <name>   <archetype>   guides: <n>   image: yes|MISSING
Then run: pnpm report --all   (watch for |r| >= 0.7 between Axes and a growing central cluster)
```

Done when: the checklist lists every file written this run.
