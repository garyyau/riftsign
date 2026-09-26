# Riftward

A personality test that matches Riftbound players to a Legend. See `CONTEXT.md` for the domain glossary.

## Deploy gate

Every push to `main` runs the Deploy to Cloudflare workflow, whose `pnpm run build` (data validation, tests, typecheck, Vite build) must be green before the site updates. Work is done only when that gate would pass: run `pnpm validate`, `pnpm vitest run` and `pnpm typecheck` before handing work over, and after any push run `gh run watch` on the new Deploy run until it succeeds. A red check is a blocker to fix or raise with the Maintainer, never a note in the summary.

## Agent skills

### Issue tracker

Issues live as GitHub issues in [`garyyau/riftward`](https://github.com/garyyau/riftward), driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
