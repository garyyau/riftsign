---
name: ingest-legends
description: Ingest new Riftbound Legends, or re-rate existing ones, as unreviewed Build drafts grounded in rated Piltover Archive decks.
disable-model-invocation: true
argument-hint: "[Legend name ... | all | deck links | picks]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, Agent, Workflow
---

Ingestion keeps every Legend's Builds matched to how players actually run it, each with a good, viable deck a player can discover. Questions are never touched.

Argument: `$ARGUMENTS`.

- Empty: **ingest** every newly released Legend, from step 1.
- One or more Legend names: **re-rate** those, from step 1.
- `all`: **re-rate** every Legend, after a ban list, a new set shifting the meta, or a major tournament. Budget: two agents a Legend; time a few Legends first and tell the Maintainer the estimate.
- `picks`, or links grouped under `## <Legend>` and style names: the Maintainer has decided the deck picks; continue from step 5 with those Legends.
- One or more Piltover Archive deck links: **score** those decks. Follow `rubric.md`, Scoring a deck, for each yourself, report each as "Reporting a deck on its own" says, then say which Legend Build each deck matches or would change (compare with `src/data/legends/<id>.json`). Change no Legend file unless the Maintainer asks; a change then goes through step 7 and lands `reviewed: false`.

Everything here is in this folder: `rubric.md` is how a deck becomes a position and how positions become Builds, `sources.md` the deck sources and how styles are picked, `candidates.ts` the deck pool, `styles.workflow.js` and `draft.workflow.js` the fan-outs, `tools.ts` the mechanical steps (run from the repo root with `pnpm tsx .claude/skills/ingest-legends/tools.ts ...`). All run output lives under `.scratch/ingest/`.

## 1. Targets

**Ingest.** Fetch `https://api.riftcodex.com/sets`, then for each set id `GET https://api.riftcodex.com/cards?set_id=<ID>&size=100&page=<n>` until a page returns fewer than 100 cards. Keep cards whose `classification.type` is `Legend`. Collapse variants to one identity by stripping the parenthetical and "Overnumbered" suffixes from `name` (`Vi - Piltover Enforcer (Signature)` and `Vi - Piltover Enforcer` are one Legend; printed names use a comma: `Vi, Piltover Enforcer`). Record name, champion (`tags[0]`), the two `classification.domain` values, `set.set_id`, and `media.image_url`. Riftcodex has no published terms; when it is down or its shape has changed, ask the Maintainer for those facts and carry on.

A candidate is new when `src/data/legends/<id>.json` is absent. The id: lowercase, drop apostrophes and periods, non-alphanumerics to single hyphens (`Kai'Sa, Daughter of the Void` → `kaisa-daughter-of-the-void`). A set code missing from `SET_CODES` in `src/lib/types.ts` gets added there; tell the Maintainer. For each new Legend write a stub: `id`, `name`, `champion`, `domains`, `set`, `starterDeck: null`, `cardImage: "<id>.jpg"`, `ingestedAt` today, `builds: []`.

**Re-rate.** Turn the names into ids with the rule above, or pass `all`.

Then run `tools.ts targets <id...|all>`. It reads each file, so the Builds the drafters are told about are the ones on disk.

Done when: `targets` prints one entry per target Legend, or "nothing new" is printed and the run ends.

## 2. Candidates

Run `tools.ts candidates <id...|all>`. For each Legend it pulls the decks, gives each its evidence points, groups them into styles by shared cards and writes `.scratch/ingest/<id>/candidates.json` (`sources.md`, The pool). A "NEW BAN?" line means Piltover Archive knows a ban `sources.md` doesn't: add it under Bans with its date and rerun.

Done when: every target has a `candidates.json` from this run and no "NEW BAN?" line remains.

## 3. Styles

Call Workflow with `scriptPath: ".claude/skills/ingest-legends/styles.workflow.js"` and `args: { "today": "<YYYY-MM-DD>", "legends": <the targets JSON, as a JSON value> }`. One agent per Legend picks its styles and decks (`sources.md`, Picking styles), then rates each picked deck with `rubric.md`. It never reads the Builds on file, so the ratings are blind to them.

Done when: the workflow has completed with an empty `failed` list. Rerun failures by resuming with `resumeFromRunId`.

## 4. Picks

Run `tools.ts picks <workflow output file> <today>`. It turns each style's tag sheets into its mean scores and label, marks each style as a **Build** or as **decks for** a Build it can't be told apart from (`rubric.md`, Distinct), writes `.scratch/ingest/picks.md`, and prints which Legends need a decision and which are ready to draft. A MISSING line is a deck the curator never scored: rerun that Legend's curation.

Read `picks.md` as its first reviewer: every target has at least one style with a legal display deck; names are plain and match the key cards; a style's decks agree on its label or the disagreement is explained; an OUTLIER deck (1.5+ from its style's mean on an Axis) is re-read as another style or a mis-tag; each "Left out" reason holds up. Fix what you can by rerunning a Legend's curation, then rerun `picks`.

Legends marked **Single style** go straight to step 5. Legends marked **Decision needed** wait: hand their sections to the Maintainer, who will check each style's archetype and decks and edit the file, then continue from step 5 with those Legends when the picks come back.

Done when: every ready Legend is in a draft run, and every decision Legend is with the Maintainer or decided.

## 5. Draft

Call Workflow with `scriptPath: ".claude/skills/ingest-legends/draft.workflow.js"` and `args: { "today": "<YYYY-MM-DD>", "picks": ".scratch/ingest/picks.md", "legends": <the targets JSON, filtered to the Legends being drafted> }`. One agent per Legend turns its styles into keep, change, new or drop for each Build, with copy, rating any deck the Maintainer added, and checks its own numbers, card facts and copy before returning. There is no separate checker: you (step 7) and the Maintainer are the review.

Done when: the workflow has completed and its `failed` list is empty.

## 6. Apply

Run `tools.ts apply <workflow output file> <today>`. It applies every proposal and sets each changed or new Build to `reviewed: false`. Then run `pnpm validate`; fix any draft it rejects by hand from the output file.

Done when: `pnpm validate` prints `Data OK` and the apply log accounts for every drafted Legend.

## 7. Review

You are the first reviewer; the Maintainer should find nothing you could have caught.

- Read `git diff src/data/legends` for every changed Legend and hold each changed or new Build against `rubric.md`, Builds, copy rules included.
- Run `tools.ts check <target ids>`. A deck-link flag means a Build still has no real deck. A self-match flag means a Build is not reachable as its own Match; a centroid flag means its label and coordinates disagree. Fix or explain each flag on a changed Build; agreeing outside labels explain one (Midrange spans wide, and Draven, Kha'Zix and LeBlanc sit near Combo on complexity and variance alone).
- Run `pnpm vitest run`; the deploy build runs the same tests, so a red test blocks the site. Personas rank against drafts too, so a Persona landing on the wrong Archetype means a draft moved the pool; find which and why, then fix the draft or, when the rubric stands behind it, mark the Persona `knownLegendIssue` with the Builds and the reason.
- Run `pnpm report --all` and note any new Axis pair at |r| >= 0.7.
- Rewrite any line of `sources.md` this run found wrong (an API change, a new event format, a threshold that misfired) and update its "Last verified" date.

Done when: every changed Build meets `rubric.md` by your own reading, no target has a deck-link flag, every other flag on a changed Build is fixed or explained, `pnpm vitest run` is green, and `sources.md` matches what this run saw.

## 8. Images (ingest only)

Download `media.image_url` for the standard (non-Signature) printing to `public/cards/<id>.jpg`, converting PNG to JPEG with sharp if needed (`pnpm tsx -e "..."`). When no image is reachable, leave the file absent and put the gap on the checklist.

Done when: each new Legend's image exists on disk or its gap is on the checklist.

## 9. Checklist

Print, for the Maintainer:

```
Review these Builds, then set "reviewed": true on each you approve:
  src/data/legends/<id>.json   <name>   <status> <archetype>   confidence: <level>   image: yes|MISSING
Waiting on your decision:  <id>: <what picks.md asks>
Worth a look:  <doubts from step 7 about Builds left unchanged>
```

Apply replaces reviewed Builds with unreviewed drafts, and the site shows reviewed Builds only, so say how many Legends the site would show if this were pushed now (`pnpm validate` prints it; with none reviewed it fails). Push only after the Maintainer approves.

When the Maintainer delegates approval, set `reviewed: true` only on Builds you would defend from the evidence, and name any you held back.

Done when: the checklist covers every Build changed this run and every Legend still waiting on a decision.
