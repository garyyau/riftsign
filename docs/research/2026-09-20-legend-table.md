# Riftbound Legend table (Origins through Vendetta, as of 2026-09-20)

Compiled by a Sonnet 5 research agent. Domains and sets are confirmed from the Riftcodex API and are high confidence. Playstyle notes marked with a dagger (†) were inferred from Domain conventions, not quoted from a guide, and must be re-derived during ingestion.

## Riftcodex API notes

- Base: https://api.riftcodex.com. Docs: https://riftcodex.com/docs/
- Cards: `GET /cards?set_id={id}&size=100&page={n}`. No type filter; filter client-side on `classification.type === "Legend"`.
- Sets: `GET /sets`. IDs: OGN, OGS, SFD, UNL, VEN, plus promo sets PR/OPP/JDG (no Legends).
- Each Legend identity appears as 2 to 3 card objects (base, Signature, Showcase). Collapse on name before the parenthetical.
- Sample record:

```json
{
  "name": "Vi - Piltover Enforcer (Signature)",
  "riftbound_id": "unl-229*-219",
  "classification": {"type": "Legend", "supertype": null, "rarity": "Rare", "domain": ["Fury", "Order"]},
  "set": {"set_id": "UNL", "label": "Unleashed"},
  "tags": ["Vi"]
}
```

## Correction to the landscape doc

Vendetta introduced Legends with OPPOSITE Domain pairs: Kennen (Order/Chaos), Jayce (Mind/Body), Akali (Fury/Calm). The earlier claim that all Legends use non-opposite pairs is wrong.

## Counts

| Set | Legends |
|---|---|
| OGN | 12 |
| OGS | 4 |
| SFD | 12 |
| UNL | 12 |
| VEN | 9 |
| Total | 49 |

Radiance Legends: none public yet.

## Table

| Legend | Champion | D1 | D2 | Set | Starter | Playstyle (provisional) | Guide |
|---|---|---|---|---|---|---|---|
| Darius, Hand of Noxus | Darius | Fury | Order | OGN | No | Aggro board beatdown† | riftbound.gg/legends |
| Jinx, Loose Cannon | Jinx | Fury | Chaos | OGN | Yes (Champion Deck) | Aggro explosive burst | riftbound.gg/legends |
| Volibear, Relentless Storm | Volibear | Fury | Body | OGN | No | Aggro/midrange stun and smash† | riftbound.gg/legends |
| Kai'Sa, Daughter of the Void | Kai'Sa | Fury | Mind | OGN | No | Aggro scaling combo† | riftbound.gg/legends |
| Yasuo, Unforgiven | Yasuo | Calm | Chaos | OGN | No | Tempo mobility† | riftbound.gg/legends |
| Sett, The Boss | Sett | Body | Order | OGN | No | Midrange brawler† | riftbound.gg/legends |
| Miss Fortune, Bounty Hunter | Miss Fortune | Body | Chaos | OGN | No | Midrange value† | riftbound.gg/legends |
| Viktor, Herald of the Arcane | Viktor | Mind | Order | OGN | Yes (Champion Deck) | Control value engine† | riftbound.gg/legends |
| Teemo, Swift Scout | Teemo | Mind | Chaos | OGN | No | Tempo disruption† | riftbound.gg/legends |
| Leona, Radiant Dawn | Leona | Calm | Order | OGN | No | Control lockdown† | riftbound.gg/legends |
| Ahri, Nine-Tailed Fox | Ahri | Calm | Mind | OGN | No | Combo spellslinger† | riftbound.gg/legends |
| Lee Sin, Blind Monk | Lee Sin | Calm | Body | OGN | Yes (Champion Deck) | Tempo mobility aggro† | riftbound.gg/legends |
| Garen, Might of Demacia | Garen | Body | Order | OGS | Yes (Proving Grounds) | Midrange straightforward beatdown | riftbound.gg/legends |
| Lux, Lady of Luminosity | Lux | Mind | Order | OGS | Yes (Proving Grounds) | Control spellslinger | riftbound.gg/legends |
| Master Yi, Wuju Bladesman | Master Yi | Calm | Body | OGS | Yes (Proving Grounds) | Aggro tempo† | riftbound.gg/legends |
| Annie, Dark Child | Annie | Fury | Chaos | OGS | Yes (Proving Grounds) | Aggro burn | riftbound.gg/legends |
| Fiora, Grand Duelist | Fiora | Body | Order | SFD | Yes (Champion Deck) | Midrange equipment duelist | riftbound.gg/spiritforged-rumble-fiora-champion-starter-decklists/ |
| Sivir, Battle Mistress | Sivir | Body | Chaos | SFD | No | Midrange value† | riftbound.gg/legends |
| Renata Glasc, Chem-Baroness | Renata Glasc | Mind | Order | SFD | No | Control manipulation† | riftbound.gg/legends |
| Ezreal, Prodigal Explorer | Ezreal | Mind | Chaos | SFD | No | Tempo spell combo | riftbound.gg/tier-list |
| Azir, Emperor of the Sands | Azir | Calm | Order | SFD | No | Control army summoning | riftbound.gg/tier-list |
| Irelia, Blade Dancer | Irelia | Calm | Chaos | SFD | No | Aggro blade tactics | riftbound.gg/tier-list |
| Jax, Grandmaster At Arms | Jax | Calm | Body | SFD | No | Midrange weaponmaster† | riftbound.gg/legends |
| Ornn, Fire Below the Mountain | Ornn | Calm | Mind | SFD | No | Midrange equipment engine | riftbound.gg/tier-list |
| Rek'Sai, Void Burrower | Rek'Sai | Fury | Order | SFD | No | Aggro tunneling | riftbound.gg/tier-list |
| Draven, Glorious Executioner | Draven | Fury | Chaos | SFD | No | Aggro execution | riftbound.gg/tier-list |
| Lucian, Purifier | Lucian | Fury | Body | SFD | No | Aggro offense | riftbound.gg/tier-list |
| Rumble, Mechanized Menace | Rumble | Fury | Mind | SFD | Yes (Champion Deck) | Midrange mech synergy | riftbound.gg/spiritforged-rumble-fiora-champion-starter-decklists/ |
| Vi, Piltover Enforcer | Vi | Fury | Order | UNL | Yes (Champion Deck) | Aggro/midrange conquer and punish | riftbound.gg/unleashed-vi-vex-champion-starter-decklists/ |
| Rengar, Pridestalker | Rengar | Fury | Body | UNL | No | Aggro predatory rush | riftbound.gg/tier-list |
| Jhin, Virtuoso | Jhin | Fury | Mind | UNL | No | Combo/aggro burst† | riftbound.gg/legends |
| Pyke, Bloodharbor Ripper | Pyke | Fury | Chaos | UNL | No | Aggro assassin† | riftbound.gg/legends |
| LeBlanc, Deceiver | LeBlanc | Mind | Order | UNL | No | Control spell deception | riftbound.gg/tier-list |
| Vex, Gloomist | Vex | Calm | Chaos | UNL | Yes (Champion Deck) | Control anti-aggro disruption | riftbound.gg/unleashed-vi-vex-champion-starter-decklists/ |
| Master Yi, Wuju Master | Master Yi | Calm | Body | UNL | No | Aggro high speed | riftbound.gg/tier-list |
| Lillia, Bashful Bloom | Lillia | Calm | Mind | UNL | No | Combo/tempo stun† | riftbound.gg/legends |
| Poppy, Keeper of the Hammer | Poppy | Body | Order | UNL | No | Midrange defensive† | riftbound.gg/legends |
| Kha'Zix, Voidreaver | Kha'Zix | Body | Chaos | UNL | No | Aggro hunter | riftbound.gg/tier-list |
| Diana, Scorn of the Moon | Diana | Mind | Chaos | UNL | No | Tempo | riftbound.gg/tier-list |
| Ivern, Green Father | Ivern | Calm | Order | UNL | No | Control/ramp value† | riftbound.gg/legends |
| Kennen, Heart of the Tempest | Kennen | Order | Chaos | VEN | No | Aggro "Miracle" fast offense | riftbound.gg/tier-list, skillshotzgaming.com/riftbound-vendetta-legends-guide/ |
| Ambessa, Matriarch of War | Ambessa | Body | Order | VEN | No | Midrange warlord† | skillshotzgaming.com/riftbound-vendetta-legends-guide/ |
| Mel, Soul's Reflection | Mel | Mind | Chaos | VEN | No | Control value† | skillshotzgaming.com/riftbound-vendetta-legends-guide/ |
| Jayce, Defender of Tomorrow | Jayce | Mind | Body | VEN | No | Hybrid transforming midrange | riftbound.gg/tier-list |
| Shen, Eye of Twilight | Shen | Calm | Order | VEN | Yes (Showdown Deck, with Zed) | Control protect and swap | riftbound.gg/riftbound-vendetta-preconstructed-decks-all-products/ |
| Nasus, Curator of the Sands | Nasus | Calm | Mind | VEN | No | Control scale up† | skillshotzgaming.com/riftbound-vendetta-legends-guide/ |
| Zed, Master of Shadows | Zed | Fury | Chaos | VEN | Yes (Showdown Deck, with Shen) | Aggro shadow tempo | riftbound.gg/riftbound-vendetta-preconstructed-decks-all-products/ |
| Renekton, Butcher of the Sands | Renekton | Fury | Body | VEN | No | Aggro beatdown† | skillshotzgaming.com/riftbound-vendetta-legends-guide/ |
| Akali, Rogue Assassin | Akali | Fury | Calm | VEN | No | Aggro hit and run assassin | riftboundguide.com/2026/07/21/riftbound-akali-champion-deck-guide/ |

## Notes

- hextechanalytics.com/legends is paywalled (HTTP 402). Not usable as an ingestion source.
- Starter products confirmed: Origins Champion Decks (Jinx, Viktor, Lee Sin), Proving Grounds (Annie, Garen, Lux, Master Yi), Spiritforged (Rumble, Fiora), Unleashed (Vi, Vex), Vendetta Showdown Deck (Zed and Shen).
