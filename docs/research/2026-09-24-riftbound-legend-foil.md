# Riftbound Legend card foils: what they look like, and can CSS fake them?

## Summary

Riftbound's official rarity system confirms Legend cards are Rare, which means they always ship with
a "full-art frame complete with foil pattern." Riot's own copy is vague on the foil's exact optical
character (no words like "rainbow," "linear," or "starburst" from Riot itself), and no primary source
gives a precise angle-by-angle description. Independent secondary sources add texture/UV claims for
premium variants but are inconsistent and sometimes clearly AI-generated SEO filler, so this report
leans on the one confirmed official source and flags the rest as low-confidence. For the CSS question:
a pointer/tilt-driven, mask-based approach modeled on simeydotme's `pokemon-cards-css` ("reverse holo"
style specifically) is the closest realistic target for a full-bleed illustration foil; anything that
needs to respect frame boundaries (gold border only, gem only) is not achievable from a flat JPG without
a hand-painted mask.

## What real Legend foils look like, physically

- **Confirmed, official:** Riot's own "Collectability in Riftbound: Origins" post states Rare cards get
  a "Gold, full-art Frame complete with foil pattern, square rarity gem," and that all Champion Legends
  are Rare. It also says foils are "customized to enhance the art of each Rare and Epic card" —
  implying the foil is tied to the illustration, not just a uniform overlay. No pattern name (holo,
  linear, starburst) or angle-shift description is given.
  [Collectability in Riftbound: Origins](https://playriftbound.com/en-us/news/announcements/collectability-in-riftbound-origins/)
- **Confirmed, official:** Alt-art Champion Unit versions of the 12 core champions get "a more intricate
  foil treatment" than the base Legend, plus a hexagonal gem — so foil intricacy scales with variant
  tier, but again no visual description of the pattern itself. Same source as above.
- **Confirmed, official:** Overnumbered cards (collector chase cards, not a Legend-specific variant) use
  "foiling, UV treatments and texturing." Same source as above. This is the closest Riot gets to
  describing a textured (vs. purely reflective) finish, but it's said of Overnumbers, not standard
  Legends.
- **Low-confidence / could not verify:** Secondary guides (Card Gamer, Eneba, PreGradeCards) repeat the
  rarity/gem breakdown accurately but add flourishes — "textured, layered foil" for Overnumbers,
  "metallic treatment," "400+ DPI to analyze the intricate foil pattern" — that read as generic SEO/AI
  copy rather than firsthand observation, and none cite photos or video. Treat any claim about a
  specific pattern shape (starburst, hex-grid, "galaxy") as **unverified** — no source, official or
  otherwise, in this research pass described a Legend foil's pattern shape from firsthand inspection.
  [Card Gamer rarity guide](https://cardgamer.com/guides/riftbound-card-rarities/),
  [Eneba rarity guide](https://www.eneba.com/hub/collectibles/riftbound-rarity-guide/),
  [PreGradeCards grading guide](https://pregradecards.com/blog/riftbound-tcg-card-grading-complete-guide-2026)
- **Confirmed, official, but not Legend-specific:** The *Unleashed* set (Set 3, 2026) introduced a
  one-per-set "Ultimate Rare" foil tier (e.g. Baron Nashor), confirmed by multiple set-guide sites and
  pull-rate trackers, but this is a non-champion chase card, not a Legend, so it's out of scope beyond
  confirming Riot keeps escalating foil tiers over time.
  [Riftbound Unleashed set guide](https://riftbound.gg/unleashed/)
- **No source found** describing color range under light or angle-dependent shift specifically for a
  Legend card. No usable unboxing video or grading-community photo thread surfaced in this pass that
  showed a Legend foil moving under light with commentary — treat the current sheen effect's rainbow
  diagonal-band assumption as a reasonable guess, not a verified match.

## Recommended CSS imitation approach (flat JPG scan)

Base target: simeydotme's `pokemon-cards-css` (GPL-3.0 license, confirmed via the repo's `LICENSE`
file), specifically its **reverse holo** style — a foil confined to the full illustration rather than
etched into text/frame, which matches a flat scan best (no separate frame/text layer to protect). Avoid
targeting "amazing rare" / "rainbow rare" / VMAX styles, which rely on per-card foil stamp maps and
frame-aware masks the project ships as separate asset files.

Layer recipe, on top of the existing `.card-shine` sheen:

1. **Base image** — the JPG, unchanged.
2. **Sparkle/holo gradient layer** — a repeating `conic-gradient` or multi-stop `linear-gradient` of
   saturated hues (magenta → cyan → gold, matching Riftbound's gold-frame palette), blended with
   `mix-blend-mode: color-dodge` or `soft-light` at low opacity so the card art still reads through.
   This is the core trick `pokemon-cards-css` uses for its holo layer.
3. **Glare layer** — a soft radial-gradient "hotspot" blended with `overlay`, positioned via CSS custom
   properties (`--pointer-x`, `--pointer-y`) so it tracks the pointer.
4. **Driver: both animation and pointer, not either/or.** Keep the current 6s auto-loop as the idle/
   no-interaction state (covers touch devices and users who never move a pointer), and layer a
   `pointermove` listener that writes `--pointer-x/--pointer-y` custom properties to re-center the
   gradients on hover/tilt — this is exactly how `pokemon-cards-css`'s `Card.svelte` drives its
   `--pointer-from-center`, `--pointer-x`, `--pointer-y` variables into the gradient positions.
5. **Keep effects full-bleed.** Since there's no mask, let the holo and glare layers cover the entire
   card rect (already safely clipped by the existing `rounded-[5.5%/3.9%]` treatment for the baked-in
   corners) rather than trying to confine them to the illustration only.

## Not feasible with a flat, single JPG scan

- **Region-limited foil** (only the gold frame, only the domain-icon gems, only the title lockup) is
  what `pokemon-cards-css` actually does for most of its rarity styles — it ships a per-card foil PNG
  mask (the `foil` prop / `--foil` custom property feeding a `mask-image`) authored specifically for
  each card's frame geometry. A flat JPG has no alpha channel or region metadata, so there's no way to
  derive "the gold border pixels" or "the gem pixels" from the file alone.
- **True per-card intricacy variance** (Riot's claim that alt-art foil is "more intricate" than base
  Legend foil, or that Overnumbers add texturing) can't be reproduced faithfully per-card without
  hand-authored assets — a single shared CSS recipe will look uniform across every Legend, unlike the
  real cards.
- **Etched/textured (non-reflective) relief**, if real Overnumber texturing is in fact a physical
  emboss (unverified — see above), has no CSS equivalent without a normal/height map, which the flat
  JPG cannot supply.

If frame- or gem-limited foil is wanted later, the practical path is hand-authoring a small alpha mask
per Legend (following `pokemon-cards-css`'s model), not deriving it from the existing JPGs.
