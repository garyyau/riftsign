/**
 * Every Player-facing string lives here so a future localization has one file to translate.
 * Game vocabulary follows CONTEXT.md; Players see "Riftsign" where the code says Profile.
 */
import type { Domain, PlaystyleAxisId } from './axes'
import type { Archetype } from './types'

export const PROJECT_TITLE = 'Riftsign'

/** Verbatim from Riot's Legal Jibber Jabber policy, with the project title substituted. */
export const LEGAL_DISCLAIMER = `${PROJECT_TITLE} was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.`

const joinDomains = (domains: Domain[]) => domains.join(' and ')

export const STRINGS = {
  header: {
    archive: 'Piltover Archive',
  },
  landing: {
    eyebrow: 'A playstyle test for Riftbound',
    title: 'Find the Legends you were made to pilot.',
    body: 'Twenty-seven quick questions about how you like to play. No deck jargon, no sign-up. You get your Riftsign: how you like to play, the Domains that pull you, and the Legends that fit.',
    start: 'Start the test',
    continue: 'Continue where you left off',
    seeResult: 'See your Riftsign',
    retake: 'Retake the test',
    time: 'About five minutes',
    fanNote: 'A fan project. Not affiliated with or endorsed by Riot Games.',
  },
  quiz: {
    progress: (current: number, total: number) => `Question ${current} of ${total}`,
    back: 'Back',
    next: 'Next',
    optionalStep: 'Optional',
    championsEyebrow: 'One last thing',
    championsPrompt: 'Any champions you already love?',
    championsHelp:
      "Optional. Pick any you like the look of and we'll show you their best Legend for you, with an honest note on how it plays. Skip it if the names mean nothing to you yet.",
    championsSkip: 'Skip',
    championsDone: 'Show my Riftsign',
    noChampions: 'No reviewed Legends yet, so there is nothing to pick from.',
    scaleStrong: 'Definitely',
    scaleLeaning: 'Leaning',
    /** Screen-reader label for one point of a two-pole scale, e.g. "Leaning: Race them". */
    scalePoint: (strength: string, pole: string) => `${strength}: ${pole}`,
  },
  result: {
    eyebrow: 'Your Riftsign',
    sharedEyebrow: 'A shared Riftsign',
    archetypeLead: 'You play',
    sharedArchetypeLead: 'They play',
    noPool: 'No Legends have been reviewed yet, so there is nothing to match against. Your scores are still yours.',
    fitNote: 'Fit is about how a Legend plays, not how strong it is. This is not a tier list.',
    matchesTitle: 'Legends that play like you',
    sharedMatchesTitle: 'Legends that play like this',
    closeCall: (first: string, second: string) =>
      `It was close: ${first} and ${second} fit you almost equally. Start with whichever grabs you.`,
    fit: (n: number) => `${n}% fit`,
    howItPlays: 'How it plays',
    whyYou: 'Why you might like it',
    starter: (product: string) => `Starter deck: ${product}`,
    noStarter: 'No retail starter deck',
    alsoPlayed: (archetypes: string[]) => `Also played as ${archetypes.join(' or ')}`,
    deckLists: 'Deck lists on Piltover Archive',
    fullRanking: (n: number) => `Full ranking of all ${n} Legends`,
    // "Your Domains" is worded so it reads the same on a shared Riftsign; only the title changes there.
    domainsTitle: 'Your Domains',
    sharedDomainsTitle: 'Domains',
    domainFeeling: { pull: 'Strong pull', neutral: 'No strong pull', push: 'Not a draw' },
    domainsLead: (domains: Domain[]) => `${joinDomains(domains)} ${domains.length === 1 ? 'pulls' : 'pull'} clearly ahead.`,
    domainsLegends: (domains: Domain[]) =>
      domains.length === 1 ? `More Legends with ${domains[0]}, best fit first:` : `More Legends in ${joinDomains(domains)}, best fit first:`,
    domainsCovered: 'The Legends above already cover that.',
    domainsNone:
      'No Domain pulls clearly ahead, so the Legends above were picked on playstyle alone. Any Domain pair could suit.',
    lookTitle: 'Has the look you like',
    lookLead: (champion: string) => `Your best fit among the champions you picked is ${champion}.`,
    /** Playstyle gaps from the Player's scores, e.g. ["faster", "swingier"]. */
    lookGaps: (gaps: string[]) => `It's ${gaps.join(' and ')} than you like.`,
    lookClose: 'It plays close to how you like to play.',
    lookCovered: 'Your favourite champions are already in the Legends above.',
    share: 'Copy share link',
    shared: 'Link copied',
    shareFailed: 'Could not copy. The link is in your address bar.',
    retake: 'Retake the test',
    sharedNotice: "You're looking at someone else's Riftsign. Take the test to get your own.",
    takeOwn: 'Take the test',
    versionNotice: 'The test has changed since you took it. A retake might land differently.',
    olderLinkNotice: 'This Riftsign was made with an earlier version of the test.',
    scoresTitle: 'Your scores',
  },
  footer: {
    about: 'Riftsign matches your playstyle to Legends. It never rates deck strength.',
  },
  /** Open Graph copy baked into the static share pages at build time. */
  og: {
    title: PROJECT_TITLE,
    description: 'Find the Riftbound Legends that fit how you like to play.',
    tagline: 'A playstyle test for Riftbound. Fit, not tier list.',
    defaultSubtitle: 'Riftbound playstyle test',
    legendTitle: (name: string) => `${PROJECT_TITLE}: ${name}`,
    legendDescription: (name: string) => `My Riftsign matched me with ${name}. Find yours.`,
  },
} as const

export const ARCHETYPE_COPY: Record<Archetype, { name: string; description: string }> = {
  Aggro: {
    name: 'Aggro',
    description:
      'You want the game decided early, on your terms. You attack first, keep attacking, and make your opponent find answers before they find their footing.',
  },
  Tempo: {
    name: 'Tempo',
    description:
      'You like staying one step ahead. You play efficient threats, answer just enough, and keep the opponent reacting to you rather than executing their own plan.',
  },
  Midrange: {
    name: 'Midrange',
    description:
      'You adapt. Against fast decks you defend, against slow decks you push, and your units are usually the best on the table by the middle of the game.',
  },
  Control: {
    name: 'Control',
    description:
      'You let your opponent overextend, then take it all away. You value answers, patience, and winning a long game you have quietly been steering the whole time.',
  },
  Combo: {
    name: 'Combo',
    description:
      'You build toward one big moment. Most of the game is setup, and the payoff is a turn where several pieces click together and the board changes all at once.',
  },
}

/** What each Domain's cards do, from the card-pool research, in words a new Player can picture. */
export const DOMAIN_COPY: Record<Domain, string> = {
  Fury: 'Direct damage, attacking and conquering, and units that hit harder when they attack.',
  Calm: 'Stuns, pushing enemy units away, units that take hits for others, and holding battlefields.',
  Mind: 'Card draw, shrinking enemy units, gear that keeps paying off, and hidden cards.',
  Body: 'Extra runes, big units, and making your own units stronger.',
  Chaos: 'Discarding to dig deeper, playing cards back from the trash, hidden cards, and surprises.',
  Order: 'Lots of small units, value when your units die, and sacrificing them for more.',
}

/** How a Build differs from the Player on each Axis: [when the Build sits higher, when it sits lower]. */
export const GAP_WORDS: Record<PlaystyleAxisId, [string, string]> = {
  pace: ['faster', 'slower'],
  stance: ['more proactive', 'more reactive'],
  complexity: ['more intricate', 'simpler'],
  variance: ['swingier', 'steadier'],
}
