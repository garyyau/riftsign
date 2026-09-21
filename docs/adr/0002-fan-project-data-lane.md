# 0002. Fan-project data lane, no official Riot API

Date: 2026-09-20
Status: Accepted

## Context

Riftsign needs about five facts per Legend (name, Champion, two Domains, set) plus a card image. Two legal lanes exist (see docs/research/2026-09-20-licensing-and-hosting.md):

1. Riot Developer Portal, Riftbound policy. Requires application and approval, no published timeline, policy language disfavors small personal-audience apps. Apps on this lane may use ONLY assets served by the official API; mixing in unofficial sources is prohibited.
2. Riot's "Legal Jibber Jabber" fan-content policy. Permits non-commercial fan projects to use card images, champion art and names, provided a verbatim disclaimer is shown and no Riot logos or trademarks appear in the project's own branding or domain.

The two lanes cannot be combined.

## Decision

Riftsign is a non-commercial fan project under Legal Jibber Jabber. It never applies for or uses the official Riot API.

- Legend data lives as committed files in this repository. The published site has no runtime dependency on any card database.
- During Ingestion, the maintainer may use the unofficial Riftcodex API as a convenience to discover new Legends and confirm Domains, or may type the facts by hand. Riftcodex is credited in the README as a development tool only and is never referenced in the app.
- Card images are stored in the repository, one per Legend, sourced from official card imagery as permitted by the fan policy.
- The site displays the required disclaimer verbatim and carries no ads, sponsorships, affiliate links, or paywalls.
- The project name and domain avoid the word "Riftbound". "Rift" alone is a common word already used by many community sites.
- Deck lists are linked out to community databases (Piltover Archive), never hosted here, keeping the card-data footprint minimal.

## Consequences

- Zero approval wait and zero server cost. The site can launch as soon as it works.
- No access to official multi-language card text or any future official assets. Acceptable: the site needs neither.
- Riftcodex has no published terms. Ingestion must always work with manual entry as a fallback, and the maintainer should email its maintainers once to confirm the snapshot use is welcome.
- Switching to the official lane later would require removing every unofficially sourced asset first. Treat as a full rebuild of the data layer, not a toggle.
