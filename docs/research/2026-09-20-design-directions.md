# Design direction research (2026-09-20)

Compiled by a Sonnet 5 research agent. Brief: minimal with a hint of style, gamer audience 18 to 35, React and Tailwind, no Riot marks in branding.

## Riftbound's visual language (grounding, not copying)

- Domain colors by name (no official hex published): Fury red, Calm green, Mind blue, Body orange, Chaos purple, Order yellow. Desaturate for UI so six accents don't fight.
- Card aspect ratio: 63 x 88 mm, about 5:7. Size Legend card containers to 5:7 so they read as cards.
- playriftbound.com typography could not be fetched (placeholder markup). Check manually in DevTools if needed.

Sources: https://wiki.leagueoflegends.com/en-us/Riftbound:Domain, https://riftboundtcg.wiki/cards/riftbound-tcg-card-size

## Reference sites

| Site | Why it works | Borrow |
|---|---|---|
| linear.app | Whitespace is the style | Sparse layout, strong weight hierarchy |
| raycast.com | Dark, premium, glass used sparingly | Frosted panels for result cards |
| vercel.com | Monochrome extremes, no gradients | Accent only on calls to action |
| arc.net | One hero gradient on a clean base | Reserve one gradient for the reveal moment |
| op.gg (Red Dot award) | Data-dense yet legible dark UI | Tier-colored badges, hover detail |
| mobalytics.gg | Gamer stat site, dark navy, tier accents | Color-coded stat scale (fetch blocked, unverified live) |
| marvelsnapzone.com | Card-game companion, dark, not noisy | Tier badges |
| piltoverarchive.com | Nearest neighbor, dark, Domain-colored dots | Small circular Domain badges, already legible to this audience |
| 16personalities.com | Trusted multi-axis reveal | Radar as the "your shape" summary |
| Spotify Wrapped | Sequential card reveal with motion | Reveal scores one at a time before the summary |

## Result page patterns

- Radar chart: good gestalt for 5 to 8 unipolar axes. Bad for bipolar axes because the center reads as "low" regardless of pole.
- Horizontal dual-pole sliders: the clear pattern for bipolar traits (two labeled ends, marker between).
- Sequential reveal: builds anticipation, one axis per card, then a summary card.

Recommendation for Riftsign: four playstyle Axes as horizontal banded bars, three Domain Axes as dual-pole sliders with Domain names at each end. Optional small radar only as a decorative share-image summary.

## Three candidate directions

### A. Signal (dark, one neon accent, editorial)

- Palette: bg #0A0A0C, surface #151517, text #EDEDED, one electric accent (cyan or magenta). Domain colors only as small badge dots.
- Type: Space Grotesk headlines, Inter body.
- Motifs: flat dark panels with 1px borders, slim top progress bar, thin single-accent score bars, 5:7 Legend cards with art bleeding to edges.
- References: linear.app, raycast.com.
- Trade-off: most minimal, best card-art contrast, risks reading as generic SaaS unless the accent and micro-interactions carry energy.

### B. Paper Rift (light, warm paper, Domain colors are the only color)

- Palette: bg #F6F1E7, surface #FBF7EE, text #1B1B18. No brand accent; the six Domain colors do all color work.
- Type: Fraunces headlines, Inter or Work Sans body.
- Motifs: score bars tinted per Domain, progress dots, Legend cards with a Domain-colored top stripe.
- References: piltoverarchive.com badge logic, linear.app light mode.
- Trade-off: most distinctive and cheapest to build, strongly on-theme without Riot IP. Card art pops less on light. Six accents must be desaturated or it stops being minimal.

### C. Arcane Ledger (dark, faint texture, gold)

- Palette: bg #0D0D12 with 3 to 5 percent grain, gold accent about #C9A227 for headings and hairlines, Domain colors for score bars and badges.
- Type: Cormorant or Spectral headlines, Inter body.
- Motifs: thin gold rules between sections, gold progress bar with faint glow, Legend cards with a hairline gold frame.
- References: arc.net single hero moment, marvelsnapzone.com badges.
- Trade-off: best fit for "gamer plus fantasy TCG" mood, excellent art legibility. Riskiest for minimalism; texture and gold must stay very subtle.

## Fonts (free, not sci-fi cliche)

- Space Grotesk https://fonts.google.com/specimen/Space+Grotesk
- General Sans https://www.fontshare.com/fonts/general-sans
- Fraunces https://fonts.google.com/specimen/Fraunces
- Inter https://fonts.google.com/specimen/Inter
- Sora https://fonts.google.com/specimen/Sora
- Spectral https://fonts.google.com/specimen/Spectral

## Unverified

- playriftbound.com CSS and fonts.
- Official Domain hex values.
- mobalytics.gg live visuals (403).
- 16personalities result chart implementation.
