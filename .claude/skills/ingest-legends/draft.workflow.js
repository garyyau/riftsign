export const meta = {
  name: 'ingest-legends-draft',
  description: 'One agent per Legend drafts its Builds from the deck picks and checks its own card facts and copy',
  phases: [{ title: 'Draft', detail: 'one agent per Legend' }],
}

// args: { today: 'YYYY-MM-DD', picks: '.scratch/ingest/picks.md', legends: <output of `tools.ts targets`, filtered to the ids that are ready> }
const SKILL = '.claude/skills/ingest-legends'
const ARCHETYPES = ['Aggro', 'Tempo', 'Midrange', 'Control', 'Combo']
const { today, legends, picks } = args

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    legendId: { type: 'string' },
    starterDeck: { type: ['string', 'null'], description: 'Retail product name or null. Only read for new Legends.' },
    evidenceSummary: { type: 'string', description: 'Which picked styles became which Builds, and any deck you rated that the picks file had no sheet for.' },
    builds: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['keep', 'change', 'new', 'drop'] },
          archetype: { type: 'string', enum: ARCHETYPES },
          previousArchetype: { type: 'string', enum: ARCHETYPES, description: 'For a change that relabels: the archetype in the file today.' },
          evidence: { type: 'string', description: 'Why this status: counts, placements, events, dates, sources.' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          pace: { type: 'number', minimum: 0, maximum: 10 },
          stance: { type: 'number', minimum: 0, maximum: 10 },
          complexity: { type: 'number', minimum: 0, maximum: 10 },
          variance: { type: 'number', minimum: 0, maximum: 10 },
          howItPlays: { type: 'string' },
          whyYou: { type: 'string' },
          guideUrls: { type: 'array', items: { type: 'string' } },
          deckListUrl: { type: 'string' },
          ratingNotes: { type: 'string' },
        },
        required: ['status', 'archetype', 'evidence', 'confidence'],
      },
    },
  },
  required: ['legendId', 'starterDeck', 'evidenceSummary', 'builds'],
}

const modeTask = (l) =>
  l.mode === 'new'
    ? `This is a NEW Legend: its file has card facts and \`builds: []\`. Return every Build it should have (status "new", at least one) and its starterDeck.`
    : `This is a RE-RATE. The file holds these Builds today: ${l.builds.map((b) => `${b.archetype} (${['pace', 'stance', 'complexity', 'variance'].map((a) => b[a]).join('/')})`).join(', ')}. Return exactly one entry per existing Build (status keep, change or drop; a relabel is a change with previousArchetype), plus any Build with status "new". Put starterDeck: null.`

const prompt = (l) => `Draft the Builds of the Riftbound Legend "${l.name}" (id ${l.id}) from the deck picks. Today is ${today}.

Read first: ${SKILL}/rubric.md, "Builds" (the bar, coordinates, changes, notes, copy, links), the "## ${l.name}" section of ${picks} (edited by the Maintainer where it says so; it is the decision), src/data/legends/${l.id}.json, and two or three Builds of the same Archetypes in other src/data/legends/ files for the copy's voice.

${modeTask(l)}

Each style marked **Build** in the picks is one Build; a style marked **decks for X** adds its decks to X's ratingNotes as other ways to play it. Coordinates and label come from \`tools.ts style\` over that style's scored tag sheets in .scratch/ingest/${l.id}/. A deck the Maintainer added has no sheet yet: rate it with ${SKILL}/rubric.md, "Scoring a deck", into the same folder. The Maintainer's label or name in the picks overrides the tool's; say so in ratingNotes.

A keep is a Build whose label, coordinates (all within 1.5) and deckListUrl already match the picks. Anything else is a change carrying every draft field: pace, stance, complexity, variance, howItPlays, whyYou, guideUrls, deckListUrl (the style's first deck), ratingNotes. Reuse copy that still fits. A Build on file that no picked style supports is a drop, unless it is the last Build.

You are the only check before the Maintainer. Before returning, for every change or new entry: rerun \`tools.ts style\` and confirm your numbers and label match it; look up every card named in the copy with \`tools.ts card\` and correct any cost or effect; read the copy once more against the Copy rules; confirm each guideUrl describes this list and not a starter or banned version.

Your structured output is the whole deliverable. Write nothing outside .scratch/ingest/${l.id}/.`

phase('Draft')
const drafts = await parallel(legends.map((l) => () => agent(prompt(l), { label: `draft:${l.id}`, phase: 'Draft', schema: RESEARCH_SCHEMA, model: 'opus', effort: 'medium' })))

const results = legends.map((l, i) => ({ legend: l, research: drafts[i] || null }))
const failed = results.filter((r) => !r.research).map((r) => r.legend.id)
if (failed.length) log(`No draft for: ${failed.join(', ')}`)
return { results, failed }
