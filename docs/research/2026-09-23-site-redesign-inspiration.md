# Site redesign inspiration (2026-09-23)

Brief: research visual design inspiration for the Riftward quiz redesign — 10-15 live reference sites (quiz flows + game marketing/companion sites), synthesize 5 design directions built around the existing Riftward logo system, and find verifiable Riftbound card/key art placeholder URLs.

The existing logo mark that every direction below must reuse: a vertical cyan (`#3BE8D0`) light beam rising from an amber (`#E8B04B`) outlined, flattened-hexagon base on near-black (`#0A0C12`); three fading cyan chevrons per side pointing outward from the base; wordmark RIFTWARD in Michroma, wide tracking, over a thin divider with a small amber diamond.

## Reference sites

### Quiz / personality-result flows

| Site | What it does well | Game-UI touches worth borrowing |
|---|---|---|
| [16personalities.com](https://www.16personalities.com/) | 2019 ground-up redesign (case study on [Dribbble](https://dribbble.com/shots/12237928-16Personalities-com-Website)) drove a real conversion lift; clean type system, one accent color per axis, radar/percentage-bar hybrid on the result page reads as data without feeling clinical. | Bipolar axis bars (two labeled poles, marker between) — the direct model for a "Domain leaning" stat. |
| Wizarding World [Sorting Hat quiz](https://www.harrypotter.com/quiz/the-sorting-hat-quiz) | Long-running quiz refreshed for 2026 with new illustration while keeping the same question bank; ~7-8 questions max per session keeps it short; the reveal is a full-screen house-crest moment, not just text. | Crest/emblem as the payoff image, exactly like a Legend card would be. |
| Spotify Wrapped (2025) ([Newsroom writeup](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/), [Rive case study](https://rive.app/blog/spotify-used-rive-for-spotify-wrapped-2025)) | Built on Rive; sequential card-by-card reveal ("visual mixtape") where each stat gets its own beat before a final summary card; high-contrast base with 2-3 bold accents, not a rainbow. | One stat per screen building to a summary — good model for revealing Domain scores before the Legend reveal. |
| Co-Star ([design critique](https://ixd.prattsi.org/2022/02/design-critique-co-star-iphone-app/), [Medium teardown](https://medium.com/demagsign/how-the-design-of-the-astrology-app-co-star-is-conquering-the-masses-d6b6d235c806)) | Stark black-and-white, centered type, almost no chrome — proves a "mystical" quiz can read as premium without color noise. | None — useful as a restraint check, not a HUD reference. |
| Duolingo onboarding ([UX breakdown](https://userguiding.com/blog/duolingo-onboarding-ux), [pageflows](https://pageflows.com/post/ios/onboarding/duolingo/)) | Personalization questions up front, a determinate progress bar that sets effort expectations, CTA button only activates once an answer is picked, and a "building your course" loading beat before the payoff. | Determinate progress + a manufactured "compiling your result" loading state before the Legend reveal. |
| Typeform quiz templates ([templates](https://www.typeform.com/templates/c/quizzes/), [help docs on outcome quizzes](https://help.typeform.com/hc/en-us/articles/360058072351-Outcome-quizzes)) | One question per screen, huge type, minimal chrome, scored "outcome quiz" pattern is the generic version of what Riftward already does. | Single-question full-bleed screen — validates keeping question steps uncluttered. |

### Game marketing / companion sites

| Site | What it does well | Game-UI touches worth borrowing |
|---|---|---|
| [playriftbound.com](https://playriftbound.com/en-us/) (redirect target of riftbound.leagueoflegends.com — confirmed via 301) | Modular vertical sections (hero video, product grid, news feed), dark LoL-branded theme, minimal top nav with 1-2 CTAs. Page is heavily client-rendered so exact CSS/hex values aren't visible via fetch — note as unverified. | Numbered product-grid cards; sparse nav restraint. |
| [Piltover Archive](https://piltoverarchive.com/cards) (community deck builder/card DB) | Dark theme, six small circular "Domain" color swatches (Fury, Calm, Mind, Body, Chaos, Order) used as compact badges next to filters and card entries; dense filter sidebar stays legible because color is the only differentiator, not size or weight. | Domain-colored circular badges — near-identical need to Riftward's "why you matched" stat/leaning display. Confirms Domain names for copy. |
| [Mobalytics](https://mobalytics.gg/) | "Gamer Performance Index" rendered as a simple multi-axis graph; stat-heavy pages stay scannable via consistent card modules and a single tier-color scale. | Tier-colored stat scale for a runner-up ranking list. |
| Marvel Snap UI ([case study](https://medium.com/design-bootcamp/marvels-snap-ui-ux-case-study-9f727d8f3875), [Game UI Database entry](https://www.gameuidatabase.com/gameData.php?id=1785)) | Design team's explicit rule: "the UI should always serve to highlight the card" — chrome recedes, card art is the hero. On-reveal flip animation is the whole climax of a turn. | Card-forward layout discipline; a flip/reveal animation as the payoff, not overlay banners. |
| Destiny 2 / Bungie UI ([font analysis](https://madegooddesigns.com/destiny-font/), [community UI framework](https://github.com/itssimple/destiny-ui-css)) | Wide, geometric, engineered wordmark; rarity-tier colors and progress bars carry meaning without extra ornamentation; HUD stays legible in motion because it's built from few, consistent primitives. | Rarity-tier color coding → could map to Legend "match strength" tiers; minimal HUD brackets around key stats. |
| Legends of Runeterra visual identity ([Behance](https://www.behance.net/gallery/125951493/Legends-of-Runeterra-Visual-Identity)) | Riot's own card-game brand system — same problem Riftward has (fantasy card game + digital companion) solved with restrained gold/dark palette and card-forward hero art. | Direct sibling-brand reference for how Riot balances "card game" with "not overdone esports skin." |
| Hades / Supergiant Games ([supergiantgames.com/games/hades](https://www.supergiantgames.com/games/hades/)) | Ink-influenced illustration style, warm limited palette, no HUD clutter on marketing pages — art carries the whole page. | Confirms that a restrained, art-forward approach (vs. dense HUD) is a legitimate premium direction, not just a safe one. |

Two searches (Valorant HUD chevrons, U.GG/Blitz.gg stat-bar specifics) returned mostly secondary/tangential results rather than verifiable first-party detail — flagged as **unverified**, don't cite specific hex/type choices for those two beyond "dark, tier-colored, data-dense," which is already covered by Mobalytics and op.gg (see the prior `2026-09-20-design-directions.md` note on op.gg).

## Five design directions

Every direction reuses: the vertical **beam**, the amber **hex base**, the fading **chevrons**, and the amber **diamond divider**. Palette values below are derived from the logo's cyan `#3BE8D0`, amber `#E8B04B`, and near-black `#0A0C12`.

### 1. Signal Beam — "the logo's light beam becomes the whole interaction model"

- **Concept:** the cyan beam is a literal progress rail that fills as you answer; the hex base is the "you are here" marker.
- **Palette:** bg `#0A0C12`, surface `#12151D`, beam/accent `#3BE8D0`, amber `#E8B04B`, text `#EDEDED`, muted `#7A8494`.
- **Type:** Michroma (display, logo + big numerals only) / Inter (body, questions, UI).
- **Landing:** full-height beam animates upward behind the hero copy on load; hex base sits at the bottom holding the CTA button; chevrons flank the CTA, pulsing outward on hover.
- **Question step:** progress becomes a vertical or horizontal beam-fill bar (not a generic bar) — segments light cyan as each question is answered; current segment has the hex-base glyph as a marker.
- **Result:** Legend card art rises "out of" the beam (art clipped to a hex-topped panel); Domain stat bars styled as short beam segments in cyan-on-dark; runner-up list uses small chevron bullets pointing at each row.
- **References:** Destiny 2 (rarity-tier bars, engineered wordmark restraint), Duolingo (determinate progress), Legends of Runeterra (card-forward restraint).

### 2. Hex Ledger — "card-forward, chrome recedes" (Marvel Snap discipline)

- **Concept:** treat every screen as a card; the logo's flattened hex becomes the card frame motif, art is the hero, UI ornament is minimal.
- **Palette:** bg `#0A0C12`, card surface `#0F1219`, hex-outline amber `#E8B04B` at low opacity as frame only, cyan `#3BE8D0` reserved for the single primary action per screen, text `#E7E9EE`.
- **Type:** Michroma (wordmark + result Legend name only) / Sora (everything else — slightly warmer geometric sans than Inter to feel less SaaS).
- **Landing:** near-empty stage, single centered beam+hex mark, one line of copy, one CTA — closer to Hades' art-forward marketing pages than a dashboard.
- **Question step:** answer options are flattened-hex tiles (echoing the base shape), 2-5 across; progress shown only as a thin diamond-divider rule with filled diamonds per step (reuses the wordmark's divider motif instead of a generic bar).
- **Result:** Legend card gets full card-flip reveal animation (Marvel Snap style); stat bars appear only after the flip settles; runner-ups shown as small stacked hex-framed thumbnails, not a list.
- **References:** Marvel Snap (card-first hierarchy, reveal-as-climax), Hades (restraint, art-forward), Piltover Archive (Domain badge convention).

### 3. Domain Ledger — "the six Domain colors do the color work, logo stays monochrome"

- **Concept:** the beam/hex/chevron mark stays strictly cyan-amber-black everywhere except the result screen, where the six Riftbound Domain colors (Fury, Calm, Mind, Body, Chaos, Order — per Piltover Archive's own filter UI) light up as the "why you matched" system.
- **Palette:** base bg `#0A0C12`, surface `#141822`, logo cyan/amber as above, Domain accents desaturated ~15% from Piltover Archive's swatches so six colors don't fight (exact hex TBD — pull from Piltover Archive's rendered swatches, not published here since Riot hasn't confirmed official hex).
- **Type:** Michroma (headlines) / Work Sans (body — slightly rounder, friendlier for a personality quiz than Inter).
- **Landing:** monochrome cyan/amber only — no Domain color until the quiz starts, so the reveal of color at the result screen feels earned.
- **Question step:** progress bar is monochrome cyan chevrons ticking off; answer options stay neutral (no Domain color leakage pre-result, to avoid telegraphing the answer key).
- **Result:** Domain stat bars each take their Domain's color as a horizontal bar (16personalities-style bipolar bars where relevant, e.g. Order vs. Chaos as opposite poles on one bar); runner-up list uses small Domain-colored circular badges exactly like Piltover Archive's filter dots.
- **References:** Piltover Archive (Domain badge convention, direct terminology), 16personalities (bipolar stat bars), Mobalytics (tier-color stat scale for runner-ups).

### 4. Wrapped Rift — "sequential reveal, one stat at a time"

- **Concept:** borrow Spotify Wrapped's card-by-card reveal pacing for the result screen instead of dumping all stats at once; the beam animates as the connective motion between cards.
- **Palette:** bg `#0A0C12`, two "beat" surfaces alternating `#12151D`/`#171B26`, cyan `#3BE8D0` and amber `#E8B04B` as the only two accent colors (deliberately fewer than Wrapped's 3-4, to stay restrained), text `#EDEDED`.
- **Type:** Michroma (per-card headline, e.g. "YOUR TOP DOMAIN") / Sora (supporting copy).
- **Landing:** static, calm — the motion budget is spent entirely on the result sequence, not the hero (avoids "loud esports skin" by front-loading restraint).
- **Question step:** simple, static progress dots (small hex outlines, filled amber as completed) — deliberately unflashy so the result sequence feels like the payoff.
- **Result:** 3-4 sequential full-screen "beats" (top Domain leaning → second Domain → Legend card reveal via beam-wipe transition → runner-up list), each advancing on tap/scroll like Wrapped; final beat is the shareable card (Legend art + stat bars baked into one image).
- **References:** Spotify Wrapped (sequential reveal, motion-as-story), Wizarding World Sorting Hat (single big emblem payoff), Duolingo (manufactured anticipation beat before result).

### 5. Ledger Noir — "Co-Star restraint, Riftbound flavor"

- **Concept:** strip color almost entirely; let the cyan beam and amber diamond be the only two color notes in an otherwise monochrome, high-contrast, centered-type system — closest to "not a loud esports skin" of all five.
- **Palette:** bg `#0A0C12`, text near-white `#F2F3F5`, single cyan accent `#3BE8D0` for interactive/active states, single amber accent `#E8B04B` reserved only for the result Legend name and the diamond divider, no other color anywhere (Domain leanings shown as grayscale bar length, not color, with a small Domain-name label).
- **Type:** Michroma (wordmark only, used sparingly) / Inter (everything else, centered alignment on key moments the way Co-Star centers its copy).
- **Landing:** almost entirely typographic and centered; logo mark is the only graphic element; copy is short, declarative.
- **Question step:** centered question text, options as plain text rows with a hairline divider (reusing the wordmark's divider-diamond as the row separator), no progress bar — just a small "3 / 8" numeral, Co-Star-style understatement.
- **Result:** Legend card art shown large and desaturated-frame (color lives in the art, not the chrome); stat bars are grayscale length-only bars with text labels; runner-up list is plain text with hairline dividers.
- **References:** Co-Star (restraint, centered type, monochrome-as-premium), Destiny 2 (few primitives, consistent HUD language used sparingly).

## Verified Riftbound card/key art placeholder URLs

All fetched with `curl -sI` on 2026-09-24 and returned `HTTP/2 200` with an image `content-type`.

| URL | Status | Source |
|---|---|---|
| `https://cdn.piltoverarchive.com/cards/OGN-001.webp?width=3840` | Verified 200, `image/webp`, served via BunnyCDN | Piltover Archive card library (community DB, not official Riot asset) |
| `https://cdn.piltoverarchive.com/cards/OGN-002.webp?width=1920` | Verified 200, `image/webp` | Same |
| `https://cdn.piltoverarchive.com/cards/OGN-003.webp?width=1920` | Verified 200, `image/webp` | Same |
| `https://cdn.sanity.io/images/dsfx7636/consumer_products_live/e026ee1a44bc86095f9afc5949c5fdb519b29c66-2560x2560.png?accountingTag=consumer_products` | Verified 200 | Official Riot merch store product hero image, [Origins Booster Display](https://merch.riotgames.com/en-us/product/riftbound-origins-booster-display/) |

Notes:
- Piltover Archive's CDN pattern is `https://cdn.piltoverarchive.com/cards/<SET>-<NUM>.webp?width=<N>` (widths seen: 640/750/828/1080/1200/1920/2048/3840) — any card code from [piltoverarchive.com/cards](https://piltoverarchive.com/cards) should follow this pattern, but Piltover Archive is a fan project, not an official Riot asset host; fine for internal placeholders, cite it if shipped publicly.
- Official Riot merch store (`merch.riotgames.com`) hosts product-hero renders via Sanity CDN (`cdn.sanity.io/images/dsfx7636/consumer_products_live/...`) — these are box/product shots, not individual card art crops.
- `riftbound.zone/en/media-kit/` offers logo PNGs (`/assets/uploads/2026/07/logo-riftbound-zone-2026.png`) but that's the *Riftbound Zone* fan-market-tracker's own brand, not Riftbound card art — not useful as card placeholder art.
- Could not find a genuine Riot Games press-kit page with bulk key-art downloads in this pass (`riotgames.com/en/press` exists per search results but wasn't fetched/verified this session) — worth a follow-up fetch if official hi-res key art is specifically needed later.
- `playriftbound.com/en-us/card-gallery/` and the homepage render card art client-side; no raw `<img>` src could be pulled via a plain fetch — if official first-party card art is required (vs. Piltover Archive's mirror), that page needs a browser-rendered check (DevTools network tab) rather than a raw HTML fetch.

## Unverified / needs a follow-up pass

- Exact CSS/hex values on playriftbound.com (client-rendered, fetch only returned structural HTML).
- Official Domain color hex values — Riot hasn't published them; any Domain palette should be sampled from Piltover Archive's rendered swatches and treated as an approximation.
- `riotgames.com/en/press` as a bulk key-art source — found via search, not yet fetched/verified.
- Valorant and U.GG/Blitz.gg specific HUD/stat-bar details — searches returned only tangential results; don't cite specifics for these two beyond what's already covered by Mobalytics and Destiny 2 above.
