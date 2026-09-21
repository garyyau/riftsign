# Licensing, data terms, and hosting research (2026-09-20)

Compiled by a Sonnet 5 research agent. Unverified items flagged at the end.

## Riot "Legal Jibber Jabber" fan policy

- Non-commercial fan projects may use Riot IP (card images, champion art, names). No paywalls, no crowdfunding. Passive ads are tolerated but we won't use them.
- Required conspicuous disclaimer, verbatim:
  "[Project Title] was created under Riot Games' 'Legal Jibber Jabber' policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project."
- Forbidden: Riot logos or trademarks in our branding, domain, or handles; implying endorsement.
- Source: https://www.riotgames.com/en/legal

## Riot Developer Portal, Riftbound policy

- Apps using the official API may ONLY use assets provided by that API. No mixing with unofficial sources.
- Approval requires demonstrating the use case (prototype or mockups). No published timeline. Policy language disfavors "apps with a small, personal audience".
- Approved categories include deck builders and card libraries.
- Source: https://developer.riotgames.com/policies/riftbound

## Riftcodex

- Unofficial open REST API, no auth for reads. Card records include image_url, artist attribution, alt text.
- Docs: https://riftcodex.com/docs/endpoints/cards/
- No formal ToS, rate limits, or snapshot policy found. Contact: support@riftcodex.com.

## Piltover Archive

- ToS forbids scraping and commercial reuse. Deep-linking is not addressed.
- Read-only MCP server (github.com/Liaxum/PiltoverArchives-mcp): search_cards, get_cards, list_sets, search_decks, get_deck. Reverse-engineered, not sanctioned.
- Source: https://piltoverarchive.com/terms-of-service

## Card images

- Official gallery: https://playriftbound.com/en-us/card-gallery/
- No documented stable Riot CDN URL pattern by card code found. Community sites self-host or mirror.

## Hosting free tiers

| Host | Bandwidth | Builds | Functions | Notes |
|---|---|---|---|---|
| GitHub Pages | 100 GB/mo soft | 10/hr | none | 1 GB site |
| Cloudflare Pages | unmetered static | 500/mo | 100k req/day | dynamic OG possible |
| Vercel Hobby | 100 GB/mo | 6000 min/mo | 1M/mo | non-commercial only |

## Unverified

- Riot API approval time and whether a small fan quiz qualifies.
- Riftcodex terms, rate limits, snapshot stance.
- Piltover Archive stance on deep-linking.
- Stable Riot image URL pattern.
