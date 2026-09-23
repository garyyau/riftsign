/**
 * One-off: drafts the 49 pre-Radiance Legend files from docs/research/2026-09-20-legend-table.md.
 * Playstyle coordinates are Archetype templates plus small nudges from the research notes, so
 * every file is written with reviewed: false. Re-rate with /ingest-legends before approving.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { domainCoordinates } from '../src/lib/schemas'
import type { Archetype, Legend, SetCode } from '../src/lib/types'
import type { Domain } from '../src/lib/axes'

type Row = [name: string, champion: string, d1: Domain, d2: Domain, set: SetCode, starter: string | null, notes: string, guide: string]

const ROWS: Row[] = [
  ['Darius, Hand of Noxus', 'Darius', 'Fury', 'Order', 'OGN', null, 'Aggro board beatdown', 'https://riftbound.gg/legends'],
  ['Jinx, Loose Cannon', 'Jinx', 'Fury', 'Chaos', 'OGN', 'Origins Champion Deck', 'Aggro explosive burst', 'https://riftbound.gg/legends'],
  ['Volibear, Relentless Storm', 'Volibear', 'Fury', 'Body', 'OGN', null, 'Aggro/midrange stun and smash', 'https://riftbound.gg/legends'],
  ["Kai'Sa, Daughter of the Void", "Kai'Sa", 'Fury', 'Mind', 'OGN', null, 'Aggro scaling combo', 'https://riftbound.gg/legends'],
  ['Yasuo, Unforgiven', 'Yasuo', 'Calm', 'Chaos', 'OGN', null, 'Tempo mobility', 'https://riftbound.gg/legends'],
  ['Sett, The Boss', 'Sett', 'Body', 'Order', 'OGN', null, 'Midrange brawler', 'https://riftbound.gg/legends'],
  ['Miss Fortune, Bounty Hunter', 'Miss Fortune', 'Body', 'Chaos', 'OGN', null, 'Midrange value', 'https://riftbound.gg/legends'],
  ['Viktor, Herald of the Arcane', 'Viktor', 'Mind', 'Order', 'OGN', 'Origins Champion Deck', 'Control value engine', 'https://riftbound.gg/legends'],
  ['Teemo, Swift Scout', 'Teemo', 'Mind', 'Chaos', 'OGN', null, 'Tempo disruption', 'https://riftbound.gg/legends'],
  ['Leona, Radiant Dawn', 'Leona', 'Calm', 'Order', 'OGN', null, 'Control lockdown', 'https://riftbound.gg/legends'],
  ['Ahri, Nine-Tailed Fox', 'Ahri', 'Calm', 'Mind', 'OGN', null, 'Combo spellslinger', 'https://riftbound.gg/legends'],
  ['Lee Sin, Blind Monk', 'Lee Sin', 'Calm', 'Body', 'OGN', 'Origins Champion Deck', 'Tempo mobility aggro', 'https://riftbound.gg/legends'],
  ['Garen, Might of Demacia', 'Garen', 'Body', 'Order', 'OGS', 'Proving Grounds', 'Midrange straightforward beatdown', 'https://riftbound.gg/legends'],
  ['Lux, Lady of Luminosity', 'Lux', 'Mind', 'Order', 'OGS', 'Proving Grounds', 'Control spellslinger', 'https://riftbound.gg/legends'],
  ['Master Yi, Wuju Bladesman', 'Master Yi', 'Calm', 'Body', 'OGS', 'Proving Grounds', 'Aggro tempo', 'https://riftbound.gg/legends'],
  ['Annie, Dark Child', 'Annie', 'Fury', 'Chaos', 'OGS', 'Proving Grounds', 'Aggro burn', 'https://riftbound.gg/legends'],
  ['Fiora, Grand Duelist', 'Fiora', 'Body', 'Order', 'SFD', 'Spiritforged Champion Deck', 'Midrange equipment duelist', 'https://riftbound.gg/spiritforged-rumble-fiora-champion-starter-decklists/'],
  ['Sivir, Battle Mistress', 'Sivir', 'Body', 'Chaos', 'SFD', null, 'Midrange value', 'https://riftbound.gg/legends'],
  ['Renata Glasc, Chem-Baroness', 'Renata Glasc', 'Mind', 'Order', 'SFD', null, 'Control manipulation', 'https://riftbound.gg/legends'],
  ['Ezreal, Prodigal Explorer', 'Ezreal', 'Mind', 'Chaos', 'SFD', null, 'Tempo spell combo', 'https://riftbound.gg/tier-list'],
  ['Azir, Emperor of the Sands', 'Azir', 'Calm', 'Order', 'SFD', null, 'Control army summoning', 'https://riftbound.gg/tier-list'],
  ['Irelia, Blade Dancer', 'Irelia', 'Calm', 'Chaos', 'SFD', null, 'Aggro blade tactics', 'https://riftbound.gg/tier-list'],
  ['Jax, Grandmaster At Arms', 'Jax', 'Calm', 'Body', 'SFD', null, 'Midrange weaponmaster', 'https://riftbound.gg/legends'],
  ['Ornn, Fire Below the Mountain', 'Ornn', 'Calm', 'Mind', 'SFD', null, 'Midrange equipment engine', 'https://riftbound.gg/tier-list'],
  ["Rek'Sai, Void Burrower", "Rek'Sai", 'Fury', 'Order', 'SFD', null, 'Aggro tunneling', 'https://riftbound.gg/tier-list'],
  ['Draven, Glorious Executioner', 'Draven', 'Fury', 'Chaos', 'SFD', null, 'Aggro execution', 'https://riftbound.gg/tier-list'],
  ['Lucian, Purifier', 'Lucian', 'Fury', 'Body', 'SFD', null, 'Aggro offense', 'https://riftbound.gg/tier-list'],
  ['Rumble, Mechanized Menace', 'Rumble', 'Fury', 'Mind', 'SFD', 'Spiritforged Champion Deck', 'Midrange mech synergy', 'https://riftbound.gg/spiritforged-rumble-fiora-champion-starter-decklists/'],
  ['Vi, Piltover Enforcer', 'Vi', 'Fury', 'Order', 'UNL', 'Unleashed Champion Deck', 'Aggro/midrange conquer and punish', 'https://riftbound.gg/unleashed-vi-vex-champion-starter-decklists/'],
  ['Rengar, Pridestalker', 'Rengar', 'Fury', 'Body', 'UNL', null, 'Aggro predatory rush', 'https://riftbound.gg/tier-list'],
  ['Jhin, Virtuoso', 'Jhin', 'Fury', 'Mind', 'UNL', null, 'Combo/aggro burst', 'https://riftbound.gg/legends'],
  ['Pyke, Bloodharbor Ripper', 'Pyke', 'Fury', 'Chaos', 'UNL', null, 'Aggro assassin', 'https://riftbound.gg/legends'],
  ['LeBlanc, Deceiver', 'LeBlanc', 'Mind', 'Order', 'UNL', null, 'Control spell deception', 'https://riftbound.gg/tier-list'],
  ['Vex, Gloomist', 'Vex', 'Calm', 'Chaos', 'UNL', 'Unleashed Champion Deck', 'Control anti-aggro disruption', 'https://riftbound.gg/unleashed-vi-vex-champion-starter-decklists/'],
  ['Master Yi, Wuju Master', 'Master Yi', 'Calm', 'Body', 'UNL', null, 'Aggro high speed', 'https://riftbound.gg/tier-list'],
  ['Lillia, Bashful Bloom', 'Lillia', 'Calm', 'Mind', 'UNL', null, 'Combo/tempo stun', 'https://riftbound.gg/legends'],
  ['Poppy, Keeper of the Hammer', 'Poppy', 'Body', 'Order', 'UNL', null, 'Midrange defensive', 'https://riftbound.gg/legends'],
  ["Kha'Zix, Voidreaver", "Kha'Zix", 'Body', 'Chaos', 'UNL', null, 'Aggro hunter', 'https://riftbound.gg/tier-list'],
  ['Diana, Scorn of the Moon', 'Diana', 'Mind', 'Chaos', 'UNL', null, 'Tempo', 'https://riftbound.gg/tier-list'],
  ['Ivern, Green Father', 'Ivern', 'Calm', 'Order', 'UNL', null, 'Control/ramp value', 'https://riftbound.gg/legends'],
  ['Kennen, Heart of the Tempest', 'Kennen', 'Order', 'Chaos', 'VEN', null, 'Aggro fast offense', 'https://riftbound.gg/tier-list'],
  ['Ambessa, Matriarch of War', 'Ambessa', 'Body', 'Order', 'VEN', null, 'Midrange warlord', 'https://skillshotzgaming.com/riftbound-vendetta-legends-guide/'],
  ["Mel, Soul's Reflection", 'Mel', 'Mind', 'Chaos', 'VEN', null, 'Control value', 'https://skillshotzgaming.com/riftbound-vendetta-legends-guide/'],
  ['Jayce, Defender of Tomorrow', 'Jayce', 'Mind', 'Body', 'VEN', null, 'Midrange hybrid transforming', 'https://riftbound.gg/tier-list'],
  ['Shen, Eye of Twilight', 'Shen', 'Calm', 'Order', 'VEN', 'Vendetta Showdown Deck', 'Control protect and swap', 'https://riftbound.gg/riftbound-vendetta-preconstructed-decks-all-products/'],
  ['Nasus, Curator of the Sands', 'Nasus', 'Calm', 'Mind', 'VEN', null, 'Control scale up', 'https://skillshotzgaming.com/riftbound-vendetta-legends-guide/'],
  ['Zed, Master of Shadows', 'Zed', 'Fury', 'Chaos', 'VEN', 'Vendetta Showdown Deck', 'Aggro shadow tempo', 'https://riftbound.gg/riftbound-vendetta-preconstructed-decks-all-products/'],
  ['Renekton, Butcher of the Sands', 'Renekton', 'Fury', 'Body', 'VEN', null, 'Aggro beatdown', 'https://skillshotzgaming.com/riftbound-vendetta-legends-guide/'],
  ['Akali, Rogue Assassin', 'Akali', 'Fury', 'Calm', 'VEN', null, 'Aggro hit and run assassin', 'https://riftboundguide.com/2026/07/21/riftbound-akali-champion-deck-guide/'],
]

const TEMPLATES: Record<Archetype, { pace: number; stance: number; complexity: number; variance: number }> = {
  Aggro: { pace: 8.5, stance: 8.5, complexity: 3.5, variance: 5.5 },
  Tempo: { pace: 7, stance: 6.5, complexity: 6.5, variance: 5 },
  Midrange: { pace: 5, stance: 5.5, complexity: 4.5, variance: 4 },
  Control: { pace: 2.5, stance: 2, complexity: 6.5, variance: 3.5 },
  Combo: { pace: 5.5, stance: 5, complexity: 8.5, variance: 7.5 },
}

const NUDGES: [pattern: RegExp, axis: 'pace' | 'stance' | 'complexity' | 'variance', delta: number][] = [
  [/burst|burn|explosive/i, 'variance', 1.5],
  [/combo|engine|synergy|spellslinger/i, 'complexity', 1.5],
  [/straightforward|beatdown|offense|high speed/i, 'complexity', -1],
  [/hybrid|transforming|manipulation|deception/i, 'complexity', 1.5],
  [/defensive|protect|lockdown|anti-aggro/i, 'stance', -1.5],
  [/aggro\/midrange/i, 'pace', -1],
  [/ramp|scale up|scaling/i, 'pace', -1],
  [/disruption|stun/i, 'stance', -1],
  [/assassin|hit and run/i, 'variance', 1],
]

const archetypeOf = (notes: string): Archetype => {
  const first = notes.split(/[\s/]/)[0].toLowerCase()
  const map: Record<string, Archetype> = { aggro: 'Aggro', tempo: 'Tempo', midrange: 'Midrange', control: 'Control', combo: 'Combo' }
  return map[first] ?? 'Midrange'
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[''.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n * 2) / 2))

const outDir = path.resolve(import.meta.dirname, '../src/data/legends')
mkdirSync(outDir, { recursive: true })

for (const [name, champion, d1, d2, set, starter, notes, guide] of ROWS) {
  const archetype = archetypeOf(notes)
  const coords = { ...TEMPLATES[archetype] }
  for (const [pattern, axis, delta] of NUDGES) if (pattern.test(notes)) coords[axis] += delta
  const id = slug(name)
  const legend: Legend = {
    id,
    name,
    champion,
    domains: [d1, d2],
    set,
    starterDeck: starter,
    cardImage: `${id}.jpg`,
    ingestedAt: '2026-09-20',
    builds: [
      {
        archetype,
        coordinates: {
          pace: clamp(coords.pace),
          stance: clamp(coords.stance),
          complexity: clamp(coords.complexity),
          variance: clamp(coords.variance),
          ...domainCoordinates([d1, d2]),
        },
        howItPlays: `${notes}. Draft only: rewrite from two or three published guides during ingestion.`,
        whyYou: `Draft only: describe in second person why a Player with this Riftsign would enjoy piloting ${champion}.`,
        guideUrls: [guide],
        // Piltover Archive has no per-Legend filter URL (checked 2026-09-20); its browser filters client-side.
        deckListUrl: 'https://piltoverarchive.com/decks',
        reviewed: false,
        ratingNotes: `Seeded from docs/research/2026-09-20-legend-table.md with the ${archetype} template. Playstyle coordinates are provisional.`,
      },
    ],
  }
  writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(legend, null, 2) + '\n')
}
console.log(`wrote ${ROWS.length} Legend drafts to ${outDir}`)
