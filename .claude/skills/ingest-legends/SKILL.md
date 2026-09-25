---
name: ingest-legends
description: Ingest new Riftbound Legends, or re-rate existing ones against the current meta, as unreviewed Build drafts grounded in tournament decks.
disable-model-invocation: true
argument-hint: "[Legend name ... | all]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, Agent, Workflow
---

Ingestion keeps every Legend's Builds matched to how players actually run it. Questions are never touched.

Argument: `$ARGUMENTS`.

- Empty: **ingest** every newly released Legend.
- One or more Legend names: **re-rate** those.
- `all`: **re-rate** every Legend, after a ban list, a new set shifting the meta, or a major tournament. Budget: the 49-Legend pass on 2026-09-23 ran 54 agents, about 2.6M tokens and 20 minutes.
- One or more Piltover Archive deck links: **score** those decks. Follow `deck-rubric.md` for each yourself, report the scores, Archetype, plan and deciding cards, then say which Legend Build each deck matches or would change (compare with `src/data/legends/<id>.json`). Change no Legend file unless the Maintainer asks; a change then goes through step 5 and lands `reviewed: false`.

Everything here is in this folder: `rating-guide.md` is the bar every rating is held to, `deck-rubric.md` how one deck list becomes a playstyle position, `sources.md` the deck-source recipe, `research.workflow.js` the research fan-out, `tools.ts` the mechanical steps (run from the repo root with `pnpm tsx .claude/skills/ingest-legends/tools.ts ...`).

## 1. Targets

**Ingest.** Fetch `https://api.riftcodex.com/sets`, then for each set id `GET https://api.riftcodex.com/cards?set_id=<ID>&size=100&page=<n>` until a page returns fewer than 100 cards. Keep cards whose `classification.type` is `Legend`. Collapse variants to one identity by stripping the parenthetical and "Overnumbered" suffixes from `name` (`Vi - Piltover Enforcer (Signature)` and `Vi - Piltover Enforcer` are one Legend; printed names use a comma: `Vi, Piltover Enforcer`). Record name, champion (`tags[0]`), the two `classification.domain` values, `set.set_id`, and `media.image_url`. Riftcodex has no published terms; when it is down or its shape has changed, ask the Maintainer for those facts and carry on.

A candidate is new when `src/data/legends/<id>.json` is absent. The id: lowercase, drop apostrophes and periods, non-alphanumerics to single hyphens (`Kai'Sa, Daughter of the Void` → `kaisa-daughter-of-the-void`). A set code missing from `SET_CODES` in `src/lib/types.ts` gets added there; tell the Maintainer. For each new Legend write a stub: `id`, `name`, `champion`, `domains`, `set`, `starterDeck: null`, `cardImage: "<id>.jpg"`, `ingestedAt` today, `builds: []`.

**Re-rate.** Turn the names into ids with the rule above, or pass `all`.

Then run `tools.ts targets <id...|all>`. It reads each file, so the Builds the agents are told about are the ones on disk.

Done when: `targets` prints one entry per target Legend, or "nothing new" is printed and the run ends.

## 2. Research

Call Workflow with `scriptPath: ".claude/skills/ingest-legends/research.workflow.js"` and `args: { "today": "<YYYY-MM-DD>", "legends": <the targets JSON, as a JSON value> }`. A scout re-verifies `sources.md` and the ban list, one Opus agent per Legend researches its relevant decks and proposes keep, change, new or drop for each Build, and a skeptic tries to refute every proposed change and returns a corrected draft when it accepts one with fixes.

The agents read `src/data/legends/` throughout, so the files stay untouched until the workflow reports back; `tools.ts apply` is their single writer.

Done when: the workflow has completed and its `failed` list is empty. Rerun failures by resuming with `resumeFromRunId`.

## 3. Apply

Run `tools.ts apply <workflow output file> <today>`, using the output file path from the completion notification. It applies each skeptic-accepted proposal (the skeptic's revision when there is one), sets every changed or new Build to `reviewed: false`, and logs every rejection with its reason. Then run `pnpm validate`; fix any draft it rejects by hand from the output file.

Done when: `pnpm validate` prints `Data OK` and the apply log accounts for every target Legend.

## 4. Sources

Compare the scout brief (`scoutBrief` in the output) with `sources.md`. Rewrite any line the brief contradicts, including new bans, and update the "Last verified" date.

Done when: `sources.md` agrees with the brief.

## 5. First review

You are the first reviewer; the Maintainer should find nothing you could have caught.

- Read `git diff src/data/legends` for every changed Legend and hold each changed or new Build against `rating-guide.md`, copy rules included.
- Run `tools.ts check <changed ids>`. A self-match flag means a Build is not reachable as its own Match; a centroid flag means its label and coordinates disagree. Fix or explain each flag on a changed Build; agreeing outside labels explain one (Midrange spans wide, and Draven, Kha'Zix and LeBlanc sit near Combo on complexity and variance alone).
- Run `pnpm vitest run`. Personas rank against drafts too, so a Persona landing on the wrong Archetype means a draft moved the pool; find which and why.
- Run `pnpm report --all` and note any new Axis pair at |r| >= 0.7.
- Skim each Legend's `evidenceSummary` in the output for notes on Builds the agents kept but doubted.

Done when: every changed Build meets `rating-guide.md` by your own reading, every flag on one is fixed or explained, and tests pass.

## 6. Images (ingest only)

Download `media.image_url` for the standard (non-Signature) printing to `public/cards/<id>.jpg`, converting PNG to JPEG with sharp if needed (`pnpm tsx -e "..."`). When no image is reachable, leave the file absent and put the gap on the checklist.

Done when: each new Legend's image exists on disk or its gap is on the checklist.

## 7. Checklist

Print, for the Maintainer:

```
Review these Builds, then set "reviewed": true on each you approve:
  src/data/legends/<id>.json   <name>   <status> <archetype>   confidence: <level>   image: yes|MISSING
Rejected by the skeptics:  <id> <archetype>: <one-line reason>
Worth a look:  <doubts from step 5 about Builds left unchanged>
```

When the Maintainer delegates approval, set `reviewed: true` only on Builds you would defend from the evidence, and name any you held back.

Done when: the checklist covers every Build changed this run and every rejection.
