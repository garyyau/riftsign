export const meta = {
  name: 'ingest-legends-styles',
  description: 'One agent per Legend picks its styles and decks from the candidates, then rates every picked deck with the rubric',
  phases: [{ title: 'Curate and rate', detail: 'one agent per Legend, blind to the current Builds' }],
}

// args: { today: 'YYYY-MM-DD', legends: [{ id, name, domains }] }. Run `tools.ts candidates` first.
const SKILL = '.claude/skills/ingest-legends'
const { today, legends } = args

const CURATION_SCHEMA = {
  type: 'object',
  properties: {
    legendId: { type: 'string' },
    styles: {
      type: 'array',
      description: 'Main style first, then extras by evidence. At most 4.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Plain name from the plan or key cards, e.g. "Detonator Jinx". Never an Archetype word alone.' },
          keyCards: { type: 'array', items: { type: 'string' }, description: 'Two to four cards that make this style this style.' },
          bar: { type: 'string', enum: ['strict', 'loosened', 'best available', 'lone deck'] },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          why: { type: 'string', description: 'One or two sentences: the evidence, any merge, and why loosened if it was.' },
          display: { type: 'string', description: 'Piltover Archive deck URL shown on the site.' },
          scored: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3, description: 'Deck URLs you rated, display deck first. Each has a tag sheet on disk.' },
        },
        required: ['name', 'keyCards', 'bar', 'confidence', 'why', 'display', 'scored'],
      },
    },
    rejected: {
      type: 'array',
      items: { type: 'object', properties: { what: { type: 'string' }, reason: { type: 'string' } }, required: ['what', 'reason'] },
      description: 'Every candidate style or strong deck left out, with the reason.',
    },
    decision: { type: 'string', description: 'What only the Maintainer can settle before drafting. Empty when the Legend has one clear style.' },
    notes: { type: 'string', description: 'Anything else the Maintainer should know. Empty when nothing.' },
  },
  required: ['legendId', 'styles', 'rejected', 'decision', 'notes'],
}

const prompt = (l) => `Pick the styles and decks for the Riftbound Legend "${l.name}" (id ${l.id}, Domains ${l.domains.join('/')}), then rate every picked deck. Today is ${today}.

Read ${SKILL}/sources.md ("Picking styles" is your procedure; the rest is the API) and .scratch/ingest/${l.id}/candidates.json (the script's pool, evidence points and card-overlap groups).

These decks are for discovery: a player should find every real way to play this Legend, each shown with a good, viable list. Your judgment is what the script can't do: grey-zone merges, joke and budget brews, claimed results, names, and whether a style's pool is thin enough to loosen. Open deck pages, guides (\`/decks/<uuid>/guide\`) and \`tools.ts deck <uuid> .scratch/ingest/${l.id}/look/<uuid>.json\` as needed.

Then rate each picked style's scored decks, one at a time, following ${SKILL}/rubric.md, "Scoring a deck". Write each tag sheet to .scratch/ingest/${l.id}/<uuid>.json (\`tools.ts deck <url> .scratch/ingest/${l.id}/<uuid>.json\`, with the deck's uuid). Rate the deck in front of you; the style's other sheets stay closed until its last deck is scored.

Leave src/data/legends/ closed: the styles and scores come from the decks, not from the Builds on file. Write only under .scratch/ingest/${l.id}/ and, through \`tools.ts candidates\`, .scratch/ingest/cache/.

Done when every candidate style is either picked or in \`rejected\` with a reason, each picked style names its display deck, and \`tools.ts score\` prints final scores with a "judged" block for every URL in every \`scored\` list.`

phase('Curate and rate')
const curations = await parallel(
  legends.map((l) => () => agent(prompt(l), { label: `curate:${l.id}`, phase: 'Curate and rate', schema: CURATION_SCHEMA, model: 'opus', effort: 'high' })),
)

const failed = legends.filter((l, i) => !curations[i]).map((l) => l.id)
if (failed.length) log(`No curation for: ${failed.join(', ')}`)
return { curations: curations.map((c, i) => c && { ...c, legendId: legends[i].id }).filter(Boolean), failed }
