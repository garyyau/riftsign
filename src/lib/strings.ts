/**
 * Every Player-facing string lives here so a future localization has one file to translate.
 * Game vocabulary follows CONTEXT.md. Riftward is the brand, never a name for the Player's result.
 */
import type { Domain, PlaystyleAxisId } from './axes'

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
    rowLabel: (legends: number) => `${legends} Legends · six Domains · one that fits`,
    fanNote: 'A fan project. Not affiliated with or endorsed by Riot Games.',
  },
  quiz: {
    progress: (current: number, total: number) => `${current} of ${total}`,
    progressLabel: (current: number, total: number) => `Question ${current} of ${total}`,
    keyHint: (answers: number) => `Press 1-${answers} to answer`,
    back: 'Back',
    next: 'Next',
    finish: 'Show my Legends',
  },
  result: {
    topBuild: 'Your top Build',
    sharedTopBuild: 'Their top Build',
    otherBuild: 'Another Build',
    noPool: 'No Legends have been reviewed yet, so there is nothing to match against. Your scores are still yours.',
    fitNote: 'Fit is about how a Legend plays, not how strong it is. This is not a tier list.',
    fit: (n: number) => `${n}% fit`,
    fitPercent: (n: number) => `${n}%`,
    playedAs: 'played as',
    alsoPlayed: 'Also played as',
    and: 'and',
    bestFit: '(your best fit)',
    sharedBestFit: '(their best fit)',
    alsoPlaysTitle: 'Also plays like you',
    sharedAlsoPlaysTitle: 'Also plays like them',
    howItPlays: 'How it plays',
    starter: (product: string) => `Starter deck: ${product}`,
    playstyleTitle: 'Your playstyle',
    sharedPlaystyleTitle: 'Their playstyle',
    featuredDeck: (champion: string, archetype: string) => `${champion} ${archetype} deck list`,
    openDeck: 'Open on Piltover Archive',
    noFeaturedDeck: 'No featured deck list yet',
    browseDecks: (champion: string) => `Browse ${champion} decks on Piltover Archive`,
    // The Domain copy under the titles reads the same on a shared result; only the titles change there.
    domainsTitle: 'Your Domains',
    sharedDomainsTitle: 'Their Domains',
    domainFeeling: { pull: 'Strong pull', neutral: 'No strong pull', push: 'Not a draw' },
    domainsLead: (domains: Domain[]) => `${joinDomains(domains)} ${domains.length === 1 ? 'pulls' : 'pull'} clearly ahead.`,
    domainsNoLead: 'No Domain pulls clearly ahead.',
    moreInDomains: (domains: Domain[]) => `More in ${joinDomains(domains)}`,
    moreByDomain: 'More by Domain',
    domainsLegends: (domains: Domain[]) =>
      domains.length === 1 ? `More Legends with ${domains[0]}, best fit first:` : `More Legends in ${joinDomains(domains)}, best fit first:`,
    domainsCovered: 'The Legends above already cover that.',
    domainsNone: 'The Legends above were picked on playstyle alone, so any Domain pair could suit.',
    seeAll: (n: number) => `See all ${n} Legends, ranked`,
    share: 'Copy share link',
    shared: 'Link copied',
    shareFailed: 'Could not copy. The link is in your address bar.',
    retake: 'Retake the test',
    sharedNotice: "You're looking at someone else's result. Want your own?",
    takeOwn: 'Take the test',
    versionNotice: 'The test has changed since you took it. A retake might land differently.',
    olderLinkNotice: 'This result was made with an earlier version of the test.',
    scoresTitle: 'Your scores',
  },
  /** "Explore other Legends" on the result page. `shared*` keys are the third-person copy for someone else's result. */
  explore: {
    eyebrow: 'Explore other Legends',
    title: 'Curious about another Legend?',
    lead: 'Every Legend, ranked by how well it fits you. Pick one to see how it plays and how far it sits from your playstyle.',
    sharedLead:
      'Every Legend, ranked by how well it fits them. Pick one to see how it plays and how far it sits from their playstyle.',
    sortLabel: 'Sort Legends',
    sortFit: 'Best fit first',
    sortName: 'A to Z',
    searchPlaceholder: (count: number) => `Search ${count} Legends`,
    noResults: (query: string) => `No Legends match "${query}".`,
    scrollBack: 'Show earlier Legends',
    scrollForward: 'Show later Legends',
    rank: (rank: number) => `#${rank}`,
    portraitLabel: (rank: number, name: string) => `#${rank} ${name}`,
    rankOf: (rank: number, total: number, fit: number) => `#${rank} of ${total}  /  ${fit}% fit`,
    fit: (fit: number) => `${fit}% fit`,
    playedAs: 'played as',
    buildsLabel: 'Builds',
    compareTitle: 'Compared with you',
    sharedCompareTitle: 'Compared with them',
    you: 'You',
    them: 'Them',
    buildKey: (champion: string, archetype: string) => `${champion} as ${archetype}`,
    /** One Axis gap, e.g. "0.3 faster". */
    gap: (amount: string, word: string) => `${amount} ${word}`,
    same: 'About the same',
    close: 'It plays close to how you like to play.',
    sharedClose: 'It plays close to how they like to play.',
    /** Playstyle gap words, biggest first, e.g. ["faster", "swingier"]. */
    gaps: (words: string[]) => `It's ${words.join(' and ')} than you like.`,
    sharedGaps: (words: string[]) => `It's ${words.join(' and ')} than they like.`,
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

/** How a Build differs from the Player on each Axis: [when the Build sits higher, when it sits lower]. */
export const GAP_WORDS: Record<PlaystyleAxisId, [string, string]> = {
  pace: ['faster', 'slower'],
  stance: ['more proactive', 'more reactive'],
  complexity: ['more intricate', 'simpler'],
  variance: ['swingier', 'steadier'],
}
