# Deck sources

Last verified 2026-09-23 (Piltover Archive's newest system decks: Singapore RQ, 2026-09-10; the Los Angeles RQ from about 2026-09-25 brings the first post-ban lists). The scout re-checks this each run; when its brief contradicts a line here, update the line and its date.

## Piltover Archive API: the relevant-deck source

- Base `https://piltoverarchive.com/api/external/v1`, plain JSON, no auth, works with curl and WebFetch.
- Tournament decks are posted by the system account, authorId `08c7c126-8ec7-4594-9f37-b313a201e2e3`.
- `GET /decks?authorId=<system>&q=<champion>&page=N`: 20 per page (`limit=100` works), `pagination.total`. `sort=createdAt&order=desc` puts the newest first. `q` is a loose name search (`q=lux` also returns Viktor decks), so keep only decks whose `legend.name` matches. The `legend=`, `search=` and `author=` params are ignored.
- `GET /decks/<uuid>?expand=cards`: card list at `expandedCards.maindeck[].card.name` / `.quantity`. Only the list endpoint carries `bannedCardNames` (now-illegal cards) and `upcomingBanCards`.
- `GET /decks/featured`: the current curated tournament picks.
- Deck names carry event and placement: "【Regional Qualifier】Hartford - #6", "Singapore - Best of Vex", "Season 1 National Open - #1889". Placement tiers, strongest first: RQ top 8 and "Best of", City Challenge top finishes and low-numbered Opens, then `#500+` mass Open entries (weak evidence).
- Chinese mass events dominate the raw counts; Western RQs dominate the top cuts. Report both.
- No archetype labels. Classify each deck by its key cards (a loop, a removal suite, a low curve of units) and tally the split.
- `https://piltoverarchive.com/decks/view/<uuid>` renders server-side and is the stable per-deck link. The site's `/decks?...` filter URLs are client-side and ignore query params.

## Cross-checks

- `https://riftbound.zone/en/meta/`: tier list with one archetype label per Legend (Team Eclipse); `/en/meta/<legend>/<archetype>/` shows the list. Check its date and whether its list still runs banned cards.
- `https://hextechanalytics.com/meta`: redirects to the latest dated snapshot (`/meta/snapshots/<date>`) with tiers, wins, Top 8 counts and regional play rates; the freshest post-ban data. `/legends/<short-slug>` (`/legends/kennen`, not the full name): prose guide with a featured list.
- `https://riftbound.gg/<full-legend-slug>-guide/` (`/kennen-heart-of-the-tempest-guide/`; `/legends/` links them all) and its metagame articles: guides naming builds. Its `/tier-list/` has names only; `/meta/`, `/decks/` and `/tournaments/` pages come back empty.
- Blocked (Cloudflare 403 to WebFetch and curl): mobalytics.gg, riftdecks.com, riftmana.com. riftools.app renders client-side. riftboundguide.com has beginner guides but no deck data.

## Bans

Last known, most recent first. A list running any of these is out of date.

- 2026-09-18: Ekko, Recurrent; Stacked Deck.
- 2026-07-24: Stealthy Pursuer; The Arena's Greatest; Aspirant's Climb. (Master Yi, Wuju Bladesman is banned in 2v2 only; legal in 1v1.)
- 2026-03-31: Scrapheap; Called Shot; Fight or Flight; Draven, Vanquisher; The Dreaming Tree; Reaver's Row; Obelisk of Power.

Official source: playriftbound.com announcements.
