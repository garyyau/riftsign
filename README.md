# Riftsign

A five-minute playstyle test for Riftbound players. Answer twenty-five questions about how you like to play, get your Riftsign (seven scores), a playstyle name in plain words, and the Legends that fit it. Fit is about how a Legend plays, never how strong it is.

Static site, no server, no accounts, no analytics. Vocabulary is in `CONTEXT.md`; decisions are in `docs/adr`; the v1 spec is `docs/specs/0001-riftsign-v1.md`.

## Develop

```sh
pnpm install
pnpm dev          # local server
pnpm test         # Vitest, watch mode
pnpm typecheck
pnpm lint
pnpm validate     # schema + cross-checks on Questions and Legends
pnpm report       # inter-Axis correlation and central clustering (add --all for drafts)
pnpm simulate     # seeded simulated Players: recovery, attractors, close calls (run before/after tuning)
pnpm build        # validate, test, typecheck, vite build, share pages
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Data

- `src/data/questions.json`: the Question set. Bump `version` by hand when Question content changes.
- `src/data/legends/<id>.json`: one file per Legend, holding one to three Builds (ways the Legend is played, each a different Archetype; see ADR 0003). Only Builds with `"reviewed": true` reach the site.
- `public/cards/<id>.jpg`: one official card image per Legend.

Domain coordinates are derived from the two Domains and checked at build time. Playstyle coordinates are drafted from published guides and reviewed by a person before each Build's `reviewed` is flipped.

## Adding Legends

Run the repo-local Claude Code skill `/ingest-legends` after a set release, `/ingest-legends <Legend name>` to re-rate one, or `/ingest-legends all` to re-rate every Legend when a ban list or tournament shifts the meta. It researches each Legend's tournament decks, drafts its Builds at `reviewed: false`, downloads card images for new Legends, and prints a review checklist. Approve each Build by hand.

The 49 pre-Radiance Legends were seeded from `docs/research/2026-09-20-legend-table.md` with Archetype template coordinates and are all unreviewed. Re-rate them with the command before launch.

## Credits and policy

Riftsign is a non-commercial fan project made under Riot Games' Legal Jibber Jabber policy. Riot Games does not endorse or sponsor this project.

[Riftcodex](https://riftcodex.com) is used during ingestion, as a development tool only, to discover new Legends and confirm their Domains. It is never referenced by the site. Deck lists are linked to [Piltover Archive](https://piltoverarchive.com).
