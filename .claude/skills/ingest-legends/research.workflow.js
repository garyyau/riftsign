export const meta = {
  name: 'ingest-legends-research',
  description: 'Scout deck sources and bans, research every target Legend for its Builds, then skeptic-check each proposed change',
  phases: [
    { title: 'Scout', detail: 're-verify sources.md and the ban list' },
    { title: 'Research', detail: 'one agent per Legend' },
    { title: 'Verify', detail: 'one skeptic per Legend with a proposed change' },
  ],
}

// args: { today: 'YYYY-MM-DD', legends: <output of `tools.ts targets`> }
const SKILL = '.claude/skills/ingest-legends'
const ARCHETYPES = ['Aggro', 'Tempo', 'Midrange', 'Control', 'Combo']
const OPTS = { model: 'opus', effort: 'medium' }
const { today, legends } = args

const draftProps = {
  pace: { type: 'number', minimum: 0, maximum: 10 },
  stance: { type: 'number', minimum: 0, maximum: 10 },
  complexity: { type: 'number', minimum: 0, maximum: 10 },
  variance: { type: 'number', minimum: 0, maximum: 10 },
  howItPlays: { type: 'string' },
  whyYou: { type: 'string' },
  guideUrls: { type: 'array', items: { type: 'string' } },
  deckListUrl: { type: 'string' },
  ratingNotes: { type: 'string' },
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    legendId: { type: 'string' },
    starterDeck: { type: ['string', 'null'], description: 'Retail product name or null. Only read for new Legends.' },
    evidenceSummary: { type: 'string', description: 'Relevant decks examined (sources, sample size, dates, placements) and how they split by archetype.' },
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
          ...draftProps,
        },
        required: ['status', 'archetype', 'evidence', 'confidence'],
      },
    },
  },
  required: ['legendId', 'starterDeck', 'evidenceSummary', 'builds'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          archetype: { type: 'string', enum: ARCHETYPES },
          status: { type: 'string', enum: ['change', 'new', 'drop'] },
          accept: { type: 'boolean' },
          reason: { type: 'string' },
          revised: {
            type: 'object',
            description: 'Only when accepting with corrections: every draft field, corrected. Omit to accept the proposal as written.',
            properties: draftProps,
          },
        },
        required: ['archetype', 'status', 'accept', 'reason'],
      },
    },
  },
  required: ['verdicts'],
}

phase('Scout')
const brief = await agent(
  `Scout for a Riftbound TCG research run. Today is ${today}. Read ${SKILL}/sources.md, the recorded recipe for finding each Legend's relevant decks.

Re-verify it by fetching, then report:
1. Each recipe in sources.md: still works, or what changed (with the working replacement). Only claim a URL pattern works if you fetched it.
2. The current ban list with dates (check riftbound.gg, playriftbound.com and hextechanalytics news), flagging any ban newer than sources.md lists.
3. Dates of the newest tournament results each source holds, and any new deck source worth using.
Plain text, under 600 words. Edit no files.`,
  { label: 'scout', phase: 'Scout', ...OPTS },
)

const modeTask = (l) =>
  l.mode === 'new'
    ? `This is a NEW Legend: its file has card facts and \`builds: []\`. Return every Build it should have (status "new", at least one) and its starterDeck.`
    : `This is a RE-RATE. The file holds these Builds today: ${l.builds.map((b) => `${b.archetype} (${['pace', 'stance', 'complexity', 'variance'].map((a) => b[a]).join('/')})`).join(', ')}. Return exactly one entry per existing Build (status keep, change or drop; a relabel is a change with previousArchetype), plus any Build with status "new". Put starterDeck: null.`

const researchPrompt = (l) => `Research the Builds of the Riftbound Legend "${l.name}" (id ${l.id}, Domains ${l.domains.join('/')}). Today is ${today}.

Read first: ${SKILL}/rating-guide.md (the bar, labels, coordinates, copy rules), src/data/legends/${l.id}.json, and three to five Builds of the Archetypes you are weighing in other src/data/legends/ files so coordinates are relative to the pool.

${modeTask(l)}

Find the Legend's relevant decks with this scout brief (it supersedes ${SKILL}/sources.md where they differ):
<scout_brief>
${brief}
</scout_brief>
Tally how its relevant decks split across archetypes, and cross-check with guides. Cite only pages you fetched.

Score two to four relevant decks per Build you keep, change or add with ${SKILL}/deck-rubric.md, writing tag sheets to .scratch/ingest/${l.id}/ (\`tools.ts deck <uuid> .scratch/ingest/${l.id}/<uuid>.json\`). A Build's coordinates are the median of its decks' scores; a keep whose stored coordinates sit 1.5+ from that median on any Axis is a change.

For every change and new Build, give every draft field: pace, stance, complexity, variance, howItPlays, whyYou, guideUrls, deckListUrl, ratingNotes. A keep or drop needs only status, archetype, evidence and confidence.

Your structured output is the whole deliverable. Write nothing outside .scratch/ingest/${l.id}/.`

const verifyPrompt = (l, r) => `You are the skeptic for proposed Build changes to the Riftbound Legend "${l.name}" (id ${l.id}). Today is ${today}.

Read ${SKILL}/rating-guide.md, src/data/legends/${l.id}.json, and two or three comparable Builds in other src/data/legends/ files.

Proposal:
${JSON.stringify(r, null, 2)}

For each entry with status change, new or drop:
1. Try to refute it. Fetch its cited decks and guides and search a little yourself. Accept only what clears the bar in rating-guide.md; when you cannot confirm the evidence, reject.
2. For an accepted change or new Build, re-score at least one of its decks with ${SKILL}/deck-rubric.md (tag sheets under .scratch/ingest/${l.id}/verify/) and check the coordinates against that and against comparable Builds, and the copy against the copy rules (plain words, card facts matching card text, unslop). If anything needs fixing, return "revised" with every draft field, corrected. If it is right as written, omit "revised".
Return one verdict per change, new or drop entry. Write nothing outside .scratch/ingest/${l.id}/verify/.`

phase('Research')
const results = await pipeline(
  legends,
  (l) => agent(researchPrompt(l), { label: `research:${l.id}`, phase: 'Research', schema: RESEARCH_SCHEMA, ...OPTS }),
  (r, l) => {
    if (!r || r.builds.every((b) => b.status === 'keep')) return { legend: l, research: r, verdicts: [] }
    return agent(verifyPrompt(l, r), { label: `verify:${l.id}`, phase: 'Verify', schema: VERDICT_SCHEMA, ...OPTS }).then((v) => ({
      legend: l,
      research: r,
      verdicts: v ? v.verdicts : null,
    }))
  },
)

const failed = legends.filter((l, i) => !results[i] || !results[i].research).map((l) => l.id)
if (failed.length) log(`No research result for: ${failed.join(', ')}`)
return { scoutBrief: brief, results: results.filter(Boolean), failed }
