# Riftbound landscape research (2026-09-20)

Compiled by a Sonnet 5 research agent from web sources. Unverified items are flagged at the end.

## Game structure

- Six Domains in three opposite pairs: Fury/Calm, Mind/Body, Chaos/Order.
  - Fury: aggression. Calm: patience. Mind: intelligence. Body: physicality. Chaos: trickery. Order: unity/sacrifice.
- A Legend card defines the deck: it fixes a Champion identity and exactly two Domains. Every Main Deck and Rune Deck card must fit that pair.
- CORRECTED: Vendetta introduced opposite-pair Legends (Kennen Order/Chaos, Jayce Mind/Body, Akali Fury/Calm). See the legend-table doc.
- Card types: Champion, Legend, Spell, Unit, Rune, Gear, Battlefield, Token.

Sources: https://riftbound.wiki.fextralife.com/Domains, https://riftbound.wiki.fextralife.com/Legend, https://riftbound.wiki.fextralife.com/Card_Types

## Sets and cadence

| Set | Code | Release | Notes |
|---|---|---|---|
| Origins | OGN | 2025-10-31 | 12 Legends |
| Origins: Proving Grounds | OGS | 2025-10-31 | Starter decks: Annie, Master Yi, Lux, Garen |
| Spiritforged | SFD | Feb 2026 | 12 Legends |
| Unleashed | UNL | May 2026 | 12 Legends |
| Vendetta | VEN | 2026-07-31 | 9 Legends |
| Radiance | RAD | announced 2026-10-23 | Not released |

Cadence: roughly quarterly. 49 Champion Legends printed so far.

Sources: https://riftboundcardlist.com/guides/riftbound-sets-in-order, https://riftcompare.com/guides/riftbound-sets-in-order, https://en.wikipedia.org/wiki/Riftbound

## Archetypes

Community uses Aggro, Midrange, Control, Combo, with Tempo sometimes separate. Decks are named "Champion, Subtitle" plus a nickname (e.g. "Kennen, Heart of the Tempest: Miracle").

Vendetta-era examples: Shen (control/protect, beginner friendly), Zed (burn combo), Akali (aggro), Kennen (combo/tempo), Master Yi Wuju Bladesman (midrange), Irelia Blade Dancer (tempo), Ornn (control).

Meta/tier list sites: riftbound.gg/tier-list, mobalytics.gg/riftbound/tier-list, riftbound.zone/meta, riftmana.com/meta-tier-list, riftdecks.com/legends, riftmeta.net, hextechanalytics.com/legends.

Source: https://riftcompare.com/guides/riftbound-deck-archetypes-guide, https://riftboundguide.com/2026/08/02/which-vendetta-legend-should-i-play/

## Data sources for ingestion

- Official: Riot Developer Portal, Riftbound policy. Requires application approval. Deck builders and card libraries are approved uses; ad monetization prohibited. No anonymous public API.
  https://developer.riotgames.com/policies/riftbound
- Riftcodex (riftcodex.com): unofficial REST/JSON API covering cards, sets, champions, domains, keywords. Rate limits and cadence undisclosed.
- Piltover Archive (piltoverarchive.com): community card DB under Riot's fan policy. No visible export. Has a read-only MCP server (PiltoverArchives-mcp).
- GitHub card JSON (all unofficial, scraped): vikkumar2021/RiftboundCardDatabase, riccjohn/riftbound-card-db, Shwinsta-ra/riftacademy, andreyfsr/riftscraper.
- Deck list sites (web UI only, no confirmed API): mobalytics.gg/riftbound, riftdecks.com, riftmana.com/tournaments, riftboundstats.com/decks.

## Existing similar tools

No interactive "which Legend should I play" quiz found. Closest is a prose comparison article on riftboundguide.com. eloshowdown.com/riftbound/quiz is trivia, not a recommender.

## Unverified

- Whether every set ships a starter product.
- Piltover Archive terms and export options.
- Riftcodex rate limits, auth, cadence, and whether Legend records carry Domain metadata.
- The full 49-Legend name/Domain/set table. Needs a direct scrape of piltoverarchive.com/cards or riftbound.gg/legends.
- riftbound-api.com and the "Parse" Card Gallery API listing.
