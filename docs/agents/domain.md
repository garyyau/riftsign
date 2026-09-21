# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the domain glossary. Game terms are facts about Riftbound; project terms are decisions made in design sessions.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.
- **`docs/specs/`** — the spec behind the feature you're touching, when there is one.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

This repo is **single-context**: one root glossary, one ADR directory.

```
/
├── CONTEXT.md          ← Riftsign domain glossary (game terms + project terms)
├── docs/
│   ├── adr/            ← architectural decisions
│   ├── specs/          ← feature specs
│   └── research/       ← dated research notes from /research
└── src/
```

There is no `CONTEXT-MAP.md` and no per-context `CONTEXT.md`. If this ever becomes a real
multi-package workspace, re-run `/setup-matt-pocock-skills` to switch to a multi-context layout.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
