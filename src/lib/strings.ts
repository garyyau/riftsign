/**
 * Every Player-facing string lives here so a future localization has one file to translate.
 * Game vocabulary follows CONTEXT.md; Players see "Riftsign" where the code says Profile.
 */
import type { Domain } from './axes'
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
    body: 'Twenty-five quick questions about how you like to play. No deck jargon, no sign-up. You get your Riftsign: seven scores, a playstyle name, and the Legends that fit it.',
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
    championsEyebrow: 'One last thing',
    championsPrompt: 'Any champions you already love?',
    championsHelp: 'Optional. Picking a few nudges their Legends up your list. Skip it if the names mean nothing to you yet.',
    championsSkip: 'Skip',
    championsDone: 'Show my Riftsign',
    noChampions: 'No reviewed Legends yet, so there is nothing to pick from.',
  },
  result: {
    eyebrow: 'Your Riftsign',
    archetypeLead: 'You play',
    noPool: 'No Legends have been reviewed yet, so there is nothing to match against. Your scores are still yours.',
    fitNote: 'Fit is about how a Legend plays, not how strong it is. This is not a tier list.',
    matchesTitle: 'Your top Legends',
    fit: (n: number) => `${n}% fit`,
    howItPlays: 'How it plays',
    whyYou: 'Why you might like it',
    starter: (product: string) => `Starter deck: ${product}`,
    noStarter: 'No retail starter deck',
    deckLists: 'Deck lists on Piltover Archive',
    fullRanking: (n: number) => `Full ranking of all ${n} Legends`,
    leanTitle: 'Your Domain lean',
    leanBody: (domains: Domain[]) => `You lean ${joinDomains(domains)}. Other Legends in those Domains:`,
    leanEmpty: (domains: Domain[]) => `You lean ${joinDomains(domains)}. Your top three already cover that.`,
    leanNone: "You sit right in the middle of every Domain pair, so no lean yet. Any Domain could be yours.",
    share: 'Copy share link',
    shared: 'Link copied',
    shareFailed: 'Could not copy. The link is in your address bar.',
    retake: 'Retake the test',
    sharedNotice: "You're looking at someone else's Riftsign. Take the test to get your own.",
    takeOwn: 'Take the test',
    versionNotice: 'The test has changed since you took it. A retake might land differently.',
    olderLinkNotice: 'This Riftsign was made with an earlier version of the test.',
    scoresTitle: 'Your seven scores',
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
