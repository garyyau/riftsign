/**
 * Every Player-facing string lives here so a future localization has one file to translate.
 * Game vocabulary follows CONTEXT.md. Riftward is the brand, never a name for the Player's result.
 */
import type { Domain, PlaystyleAxisId } from './axes'
import type { Archetype } from './types'

export const PROJECT_TITLE = 'Riftward'

/** Verbatim from Riot's Legal Jibber Jabber policy, with the project title substituted. */
export const LEGAL_DISCLAIMER = `${PROJECT_TITLE} was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.`

const joinDomains = (domains: Domain[]) => domains.join(' and ')

export const STRINGS = {
  landing: {
    eyebrow: 'A playstyle test for Riftbound',
    title: 'Find the Legends you were made to pilot.',
    body: "Twenty-one quick questions about how you like to play. No deck jargon, no sign-up. You'll see your playstyle, the Domains that pull you, and the Legends that fit.",
    start: 'Start the test',
    continue: 'Continue where you left off',
    seeResult: 'See your result',
    retake: 'Retake the test',
    time: 'About five minutes',
    fanNote: 'A fan project. Not affiliated with or endorsed by Riot Games.',
  },
  quiz: {
    progress: (current: number, total: number) => `Question ${current} of ${total}`,
    back: 'Back',
    next: 'Next',
    finish: 'Show my Legends',
  },
  result: {
    eyebrow: 'Your result',
    sharedEyebrow: 'A shared result',
    archetypeLead: 'You play',
    sharedArchetypeLead: 'They play',
    noPool: 'No Legends have been reviewed yet, so there is nothing to match against. Your scores are still yours.',
    fitNote: 'Fit is about how a Legend plays, not how strong it is. This is not a tier list.',
    matchesTitle: 'Legends that play like you',
    sharedMatchesTitle: 'Legends that play like this',
    closeCall: (first: string, second: string) =>
      `It was close: ${first} and ${second} fit you almost equally. Start with whichever grabs you.`,
    sharedCloseCall: (first: string, second: string) => `It was close: ${first} and ${second} fit them almost equally.`,
    fit: (n: number) => `${n}% fit`,
    howItPlays: 'How it plays',
    whyYou: 'Why you might like it',
    starter: (product: string) => `Starter deck: ${product}`,
    noStarter: 'No retail starter deck',
    alsoPlayed: (archetypes: string[]) => `Also played as ${archetypes.join(' or ')}`,
    featuredDeck: (champion: string, archetype: string) => `${champion} ${archetype} deck list`,
    openDeck: 'Open on Piltover Archive',
    noFeaturedDeck: 'No featured deck list yet',
    browseDecks: (champion: string) => `Browse ${champion} decks on Piltover Archive`,
    // "Your Domains" is worded so it reads the same on a shared result; only the title changes there.
    domainsTitle: 'Your Domains',
    sharedDomainsTitle: 'Domains',
    domainFeeling: { pull: 'Strong pull', neutral: 'No strong pull', push: 'Not a draw' },
    domainsLead: (domains: Domain[]) => `${joinDomains(domains)} ${domains.length === 1 ? 'pulls' : 'pull'} clearly ahead.`,
    domainsLegends: (domains: Domain[]) =>
      domains.length === 1 ? `More Legends with ${domains[0]}, best fit first:` : `More Legends in ${joinDomains(domains)}, best fit first:`,
    domainsCovered: 'The Legends above already cover that.',
    domainsNone:
      'No Domain pulls clearly ahead, so the Legends above were picked on playstyle alone. Any Domain pair could suit.',
    share: 'Copy share link',
    shared: 'Link copied',
    shareFailed: 'Could not copy. The link is in your address bar.',
    retake: 'Retake the test',
    sharedNotice: "You're looking at someone else's result. Take the test to get your own.",
    takeOwn: 'Take the test',
    versionNotice: 'The test has changed since you took it. A retake might land differently.',
    olderLinkNotice: 'This result was made with an earlier version of the test.',
    scoresTitle: 'Your scores',
  },
  /** Open Graph copy baked into the static share pages at build time. */
  og: {
    title: PROJECT_TITLE,
    description: 'Find the Riftbound Legends that fit how you like to play.',
    tagline: 'A playstyle test for Riftbound. Fit, not tier list.',
    defaultSubtitle: 'Riftbound playstyle test',
    legendTitle: (name: string) => `${PROJECT_TITLE}: ${name}`,
    legendDescription: (name: string) => `My top Legend is ${name}. Find yours.`,
  },
} as const

/** `sharedDescription` says "they", for someone viewing another Player's result. */
export const ARCHETYPE_COPY: Record<Archetype, { name: string; description: string; sharedDescription: string }> = {
  Aggro: {
    name: 'Aggro',
    description:
      'You want the game decided early, on your terms. You attack first, keep attacking, and make your opponent find answers before they find their footing.',
    sharedDescription:
      'They want the game decided early, on their terms. They attack first, keep attacking, and make their opponent find answers before finding their footing.',
  },
  Tempo: {
    name: 'Tempo',
    description:
      'You like staying one step ahead. You play efficient threats, answer just enough, and keep the opponent reacting to you rather than executing their own plan.',
    sharedDescription:
      'They like staying one step ahead. They play efficient threats, answer just enough, and keep the opponent reacting instead of carrying out a plan.',
  },
  Midrange: {
    name: 'Midrange',
    description:
      'You adapt. Against fast decks you defend, against slow decks you push, and your units are usually the best on the table by the middle of the game.',
    sharedDescription:
      'They adapt. Against fast decks they defend, against slow decks they push, and their units are usually the best on the table by the middle of the game.',
  },
  Control: {
    name: 'Control',
    description:
      'You let your opponent overextend, then take it all away. You value answers, patience, and winning a long game you have quietly been steering the whole time.',
    sharedDescription:
      'They let their opponent overextend, then take it all away. They value answers, patience, and winning a long game they have quietly been steering the whole time.',
  },
  Combo: {
    name: 'Combo',
    description:
      'You build toward one big moment. Most of the game is setup, and the payoff is a turn where several pieces click together and the board changes all at once.',
    sharedDescription:
      'They build toward one big moment. Most of the game is setup, and the payoff is a turn where several pieces click together and the board changes all at once.',
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
